'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIResponse } from '@/hooks/useAIResponse';
import { ToolOutputContainer } from './components/ToolComponents';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolOutputs?: Array<{
    name: string;
    output: any;
  }>;
}

export default function LuxuryCarDealershipChat() {
  const [query, setQuery] = useState('');
  const [sessionId, setSessionId] = useState('premium_client');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const {
    sendQuery,
    isLoading,
    textResponse,
    isComplete,
    error,
    toolOutputs
  } = useAIResponse();

  useEffect(() => {
    setSessionId(`premium_client-${Date.now()}`);
  }, [])

  // Initial welcome message
  useEffect(() => {
    if (showWelcome && chatHistory.length === 0) {
      setChatHistory([{
        id: `assistant-welcome`,
        role: 'assistant',
        content: 'Welcome to our Premium Auto Concierge. How may I assist you today?',
        timestamp: formatTimestamp(new Date())
      }]);
      setShowWelcome(false);
    }
  }, [showWelcome, chatHistory.length]);

  // Scroll to bottom whenever chat history or response changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, textResponse]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let temperaryQuery = query;
    if (query.trim()) {
      const timestamp = formatTimestamp(new Date());

      // Add user message to chat history
      setChatHistory(prev => [...prev, {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query.trim(),
        timestamp
      }]);
      setQuery('');
      try {

        await sendQuery({
          query: query.trim(),
          session_id: sessionId,
        });

      } catch (err) {
        setQuery(temperaryQuery);
      }

      // Clear the input after sending
      setQuery('');
    }
  };

  // Add assistant's response to chat when it's complete
  useEffect(() => {
    console.log('useEffect triggered with:', { 
      isComplete, 
      textResponse, 
      toolOutputsLength: toolOutputs.length,
      toolOutputs 
    });
    
    if (isComplete) {
      console.log('isComplete is true, checking if we should add to chat history');
      
      // Only add to chat history if we have text or tool outputs
      if (textResponse || toolOutputs.length > 0) {
        console.log('Condition met to add response to chat history');
        
        // Use a small timeout to ensure all state updates have been processed
        setTimeout(() => {
          setChatHistory(prev => {
            // Check if we already added this response
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && 
                lastMessage.role === 'assistant' && 
                lastMessage.content === textResponse &&
                JSON.stringify(lastMessage.toolOutputs) === JSON.stringify(toolOutputs)) {
              console.log('Skipping duplicate message');
              return prev; // Already added this response
            }

            console.log('Adding new message to chat history with toolOutputs:', toolOutputs);
            
            return [...prev, {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: textResponse || "I've processed your request.",
              timestamp: formatTimestamp(new Date()),
              toolOutputs: toolOutputs.length > 0 ? [...toolOutputs] : undefined
            }];
          });
        }, 100);
      } else {
        console.log('No text response or tool outputs to add to chat history');
      }
    } else {
      console.log('Condition not met to add response to chat history');
    }
  }, [isComplete, textResponse, toolOutputs]);

  const handleQuickResponse = (response: string) => {
    setQuery(response);
    chatInputRef.current?.focus();
  };

  // Function to render individual message with optional tool outputs
  const renderMessage = (message: ChatMessage) => {
    console.log('Rendering message:', message.id, 'with toolOutputs:', message.toolOutputs);
    
    return (
      <div
        key={message.id}
        className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} mb-6`}
      >
        {/* Tool outputs */}
        {message.toolOutputs && message.toolOutputs.length > 0 && (
          <div className="mt-3 space-y-3 max-w-[90%] w-full">
            {message.toolOutputs.map((tool, toolIndex) => {
              console.log(`Rendering tool ${toolIndex}:`, tool.name, tool.output);
              return (
                <ToolOutputContainer
                  key={`${message.id}-tool-${toolIndex}`}
                  toolName={tool.name}
                  data={{ output: tool.output }}
                />
              );
            })}
          </div>
        )}

        {/* Message bubble with timestamp */}
        <div className={`mt-3 flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl p-4 shadow-sm ${message.role === 'user'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
              : 'bg-white border border-gray-100 rounded-bl-none text-black'
              }`}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
          </div>
          <span className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed bottom-4 right-4 transition-all duration-300 ease-in-out z-50 ${isMinimized ? 'w-16 h-16' : 'w-[420px] h-[600px]'}`}>
      {/* Minimized chat bubble */}
      {isMinimized ? (
        <div className="fixed bottom-4 right-4 flex items-center">
          <div className="chat-title mr-2 bg-white px-3 py-2 rounded-lg shadow-md text-blue-800 font-medium text-sm animate-fadeIn">
            Chat with Lex
            <div className="absolute w-2 h-2 bg-white transform rotate-45 right-[-4px] top-1/2 -translate-y-1/2"></div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="chat-bubble w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden"
          >
            {/* Animated dots in the background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-3 left-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.1s' }}></div>
              <div className="absolute top-10 left-6 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.4s' }}></div>
              <div className="absolute top-6 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.7s' }}></div>
            </div>

            {/* Chat icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>

            {/* Notification indicator */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse border border-white"></div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold">Chat with Lex ( SuperCar ) </h1>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    <span className="text-xs opacity-90">Online Now</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setChatHistory([])}
                  className="p-1 hover:bg-blue-800 rounded transition-colors"
                  title="Clear Chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-blue-800 rounded transition-colors"
                  title="Minimize"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Chat container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* Error display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                Unable to connect. Please try again later.
              </div>
            )}

            {/* Chat messages */}
            <div className="space-y-4">
              {chatHistory.map(message => renderMessage(message))}


              {/* Show tool outputs during streaming */}
              {isLoading && toolOutputs.length > 0 && (
                <div className="mt-3 space-y-3 max-w-[90%] mb-4">
                  {toolOutputs.map((tool, toolIndex) => (
                    <ToolOutputContainer
                      key={`streaming-tool-${toolIndex}`}
                      toolName={tool.name}
                      data={{ output: tool.output }}
                    />
                  ))}
                </div>
              )}

              {/* Show streaming response with stable layout */}
              {isLoading && textResponse.length > 3 && (
                <div className="flex justify-start mb-4 w-full min-h-[150px] text-black">
                  <div className="max-w-[85%] min-w-[120px]">
                    <div className="rounded-2xl p-4 bg-white border border-gray-100 text-black rounded-bl-none shadow-sm relative">
                      {/* Message content */}
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-black">
                        {textResponse}
                        {/* Inline cursor that doesn't affect layout */}
                        <span className="inline-block w-[2px] h-[15px] bg-blue-600 ml-[1px] align-middle opacity-70 animate-cursor-blink"></span>
                      </p>

                      {/* Status indicator in fixed position */}
                      <div className="absolute -top-2 right-0 transform translate-x-1/4 translate-y-1/4">
                        <div className="h-2 w-2 bg-blue-500 rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {isLoading && (!textResponse || textResponse.length <= 3) && (
                <div className="flex justify-start mb-4">
                  <div className="min-w-[60px] rounded-2xl p-4 bg-white border border-gray-100 text-black rounded-bl-none shadow-sm flex justify-center">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bouncy-dot"></div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bouncy-dot" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bouncy-dot" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick response options */}
          {chatHistory.length <= 1 && (
            <div className="bg-gradient-to-b from-blue-50 to-white px-4 py-3 border-t border-blue-100">
              <h5 className="text-xs font-medium text-blue-900 mb-2 flex items-center animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h5>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide items-center justify-center">
                <button
                  onClick={() => handleQuickResponse("Get Dealership Address")}
                  className="px-3 py-2 bg-white border border-blue-200 text-blue-800 rounded-lg text-sm whitespace-nowrap hover:bg-blue-50 shadow-sm transition-all hover:shadow hover:border-blue-300 flex items-center animate-slideInFromBottom"
                  style={{ animationDelay: '0.1s' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Get Dealership Address
                </button>

                <button
                  onClick={() => handleQuickResponse("Check Appointment Availability")}
                  className="px-3 py-2 bg-white border border-blue-200 text-blue-800 rounded-lg text-sm whitespace-nowrap hover:bg-blue-50 shadow-sm transition-all hover:shadow hover:border-blue-300 flex items-center animate-slideInFromBottom"
                  style={{ animationDelay: '0.2s' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600 animate-pulse" style={{ animationDuration: '3s' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Check Appointment Availability
                </button>

                <button
                  onClick={() => handleQuickResponse("Schedule Appointment")}
                  className="px-3 py-2 bg-white border border-blue-200 text-blue-800 rounded-lg text-sm whitespace-nowrap hover:bg-blue-50 shadow-sm transition-all hover:shadow hover:border-blue-300 flex items-center animate-slideInFromBottom"
                  style={{ animationDelay: '0.3s' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Schedule Appointment
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="bg-white p-4 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <input
                ref={chatInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="chat with Lex..."
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-3 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-colors shadow-sm"
                disabled={isLoading || !query.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">Powered by Adeel Atta</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}