'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface AIRequestPayload {
  query: string;
  session_id: string;
}

interface ToolOutput {
  name: string;
  output: any;
}

export function useAIResponse() {
  const [isLoading, setIsLoading] = useState(false);``
  const [textResponse, setTextResponse] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolOutputs, setToolOutputs] = useState<ToolOutput[]>([]);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  
  // Use a ref to store the current fetch controller so we can abort it if needed
  const abortControllerRef = useRef<AbortController | null>(null);
  // Use a ref to store the EventSource instance
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup function to be called when unmounting or when starting a new request
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const sendQuery = useCallback(async (payload: AIRequestPayload) => {
    // Reset states
    setIsLoading(true);
    setTextResponse('');
    setIsComplete(false);
    setError(null);
    setToolOutputs([]);
    setCurrentTool(null);
    
    // Clean up any existing connections
    cleanup();
    
    try {
      // Create a new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Make the initial POST request
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is not readable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Variables to hold the event parsing state
      let buffer = '';
      let currentEventType = '';
      let currentData = '';

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines from the buffer
        let lineEndIndex;
        while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, lineEndIndex);
          buffer = buffer.substring(lineEndIndex + 1);
          
          if (line.startsWith('event: ')) {
            // Store the event type
            currentEventType = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            // Store the data content
            currentData = line.substring(6);
            
            // Process complete SSE message
            handleSSEMessage(currentEventType, currentData);
            
            // Reset for next message
            currentData = '';
          } else if (line === '') {
            // Empty line can be a separator between messages
            // Do nothing
          } else {
            // Unexpected line format
            console.warn('Unexpected SSE line format:', line);
          }
        }
      }
      
      // Success, we're done
      setIsComplete(true);
      setIsLoading(false);
    } catch (err) {
      // Only set error if we didn't abort intentionally
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setError(err instanceof Error ? err.message : String(err));
      }
      setIsLoading(false);
    }
  }, [cleanup]);

  const handleSSEMessage = (eventType: string, data: string) => {
    console.log(`Received SSE event: ${eventType}`, data); // Log all events

    switch (eventType) {
      case 'chunk':
        console.log('Chunk received:', data);
        setTextResponse(prev => prev + data);
        break;
      case 'tool_use':
        try {
          console.log('Tool use detected:', data);
          // Simply store the tool name directly
          setCurrentTool(data.trim());
        } catch (e) {
          console.warn('Error parsing tool_use data:', e);
          setCurrentTool(data.trim());
        }
        break;
      case 'tool_output':
        try {
          console.log('Tool output received:', data);
          const parsedData = JSON.parse(data);
          console.log('Parsed tool_output JSON:', parsedData);

          // Add to tool outputs with the correct structure
          if (parsedData && parsedData.name) {
            setToolOutputs(prev => [...prev, { 
              name: parsedData.name, 
              output: parsedData.output 
            }]);
          } else if (currentTool) {
            setToolOutputs(prev => [...prev, { 
              name: currentTool, 
              output: parsedData 
            }]);
          }
        } catch (e) {
          console.warn('Failed to parse tool output:', e);
          if (currentTool) {
            setToolOutputs(prev => [...prev, { 
              name: currentTool, 
              output: data 
            }]);
          }
        }

        setCurrentTool(null);
        break;
      case 'end':
        console.log('SSE stream ended.');
        setIsComplete(true);
        setIsLoading(false);
        break;
      case 'error':
        console.error('SSE error:', data);
        setError(data);
        setIsLoading(false);
        break;
      default:
        console.warn('Unknown SSE event type:', eventType, 'with data:', data);
    }
  };

  const clearResponse = useCallback(() => {
    setTextResponse('');
    setToolOutputs([]);
    setIsComplete(false);
    setError(null);
  }, []);

  return {
    sendQuery,
    isLoading,
    textResponse,
    isComplete,
    error,
    toolOutputs,
    clearResponse,
  };
}