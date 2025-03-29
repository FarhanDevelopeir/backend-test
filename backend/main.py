import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

from utils.stream import StreamHelper
from models import QueryRequest
from llm import GroqAssistant

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="SuperCar Virtual Sales Assistant",
    description="Backend API for AI-powered car sales assistant",
    version="0.1.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Assistant
groq_assistant = GroqAssistant()

# Conversation history storage (in-memory, replace with persistent storage in production)
conversation_history = {}


@app.post("/query")
async def handle_query(request: QueryRequest):
    """
    Handle incoming queries and manage conversation history
    """
    # Get or initialize conversation history
    session_id = request.session_id
    session_history = conversation_history.get(session_id, [
        {"role": "system", "content": "You are a helpful car sales assistant named Lex."}
    ])
    
    # Add user message to history
    session_history.append({"role": "user", "content": request.query})
    
    # Define event generator for streaming response
    async def event_generator():
        try:
            print("session_history", session_history)
            # Generate response using Groq API
            try:
                response = await groq_assistant.generate_response(
                    messages=session_history, 
                    session_id=request.session_id
                )
                print("Successfully received response from Groq API")
            except Exception as api_error:
                print(f"Error calling Groq API: {api_error}")
                print(f"Error type: {type(api_error)}")
                print(f"Error details: {str(api_error)}")
                raise api_error
            
            print("response", response)
            # Stream text chunks
            if response['content']:
                async for event in StreamHelper.chunked_stream(response['content']):
                    yield event
            
            # Handle tool calls
            if response['tool_outputs']:
                for tool_output in response['tool_outputs']:
                    function_name = tool_output['name']
                    print(f"Sending tool output for {function_name}: {tool_output['output']}")
                    
                    # Yield tool use and output events
                    yield {
                        "event": "tool_use",
                        "data": function_name
                    }
                    yield {
                        "event": "tool_output",
                        "data": json.dumps({
                            "name": function_name,
                            "output": tool_output['output']
                        })
                    }
            
            # Signal end of stream
            yield {
                "event": "end",
                "data": ""
            }
            
            # Update conversation history with assistant's response
            if response['content'] or response['tool_outputs']:
                # If there's tool outputs but no content, add a placeholder
                content_to_save = response['content']
                if not content_to_save and response['tool_outputs']:
                    content_to_save = "I've processed your request."
                
                session_history.append({
                    "role": "assistant", 
                    "content": content_to_save
                })
                conversation_history[request.session_id] = session_history
        
        except Exception as e:
            print(f"Error in event generator: {e}")
            yield {
                "event": "error",
                "data": str(e)
            }
    
    # Return streaming response
    return EventSourceResponse(event_generator())

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)