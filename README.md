# SuperCar Virtual Sales Assistant - Backend Engineer Test

## Overview

This repository contains a test for backend engineers who will be working on AI-related systems. The test focuses on building a FastAPI backend that streams AI responses using Server-Sent Events (SSE) and implements tool calling functionality with Groq API. Your API will integrate with the provided frontend, which is a chat interface for Lex, a virtual sales assistant for SuperCar dealerships.

The test evaluates your ability to:
1. Implement Server-Sent Events (SSE) with FastAPI
2. Use Groq API for LLM tool calling with Llama 3.3 70B Versatile
3. Structure a maintainable backend API
4. Work with the provided frontend implementation

## Requirements

### Functional Requirements

1. Create a FastAPI application with a `/query` endpoint that accepts POST requests with:
   - `query`: The user's message
   - `session_id`: An identifier for the conversation session

2. The endpoint should return an `EventSourceResponse` (SSE) that streams different types of events:
   - `chunk`: Text chunks from the AI assistant
   - `tool_use`: When the AI decides to use a tool (function call)
   - `tool_output`: The result of a tool execution
   - `end`: Signals the end of the response stream

3. Implement the following tools that the AI can call:
   - `get_weather`: Provides weather information for a city
   - `get_dealership_address`: Returns the address of a dealership
   - `check_appointment_availability`: Checks available appointment slots
   - `schedule_appointment`: Books an appointment for a test drive

4. Maintain conversation history for each session ID
5. Handle CORS for the frontend application

### Technical Requirements

1. Use FastAPI for the API implementation
2. Use `sse-starlette` for SSE implementation
3. Implement tool calling with Groq API using Llama 3.3 70B Versatile model
4. Format and validate input/output using Pydantic models
5. Write clean, maintainable code with appropriate comments

## Getting Started

### Development with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which will set up both the backend and frontend environments for you:

1. Create a free Groq API account at https://console.groq.com/ and get your API key

2. Navigate to the `backend` directory and create a `.env` file with your Groq API key:
```bash
cd backend
cp .env.sample .env
# Edit the .env file to add your Groq API key
```

3. Run the development environment using Docker Compose:
```bash
cd ../infrastructure
docker-compose up
```

This will:
- Start the backend FastAPI service on http://localhost:8000
- Start the frontend Next.js application on http://localhost:3000
- Set up volume mounts so your code changes are reflected immediately

4. Open http://localhost:3000 in your browser to see the frontend
5. The backend includes a basic "hello world" implementation that you can use as a starting point. You'll need to modify `backend/main.py` to implement the full functionality.

### Setting Up Your Development Environment Manually

If you prefer to run without Docker, you can set up your environment directly:

1. Install the required dependencies:
```bash
pip install fastapi uvicorn sse-starlette pydantic python-dotenv groq
```

2. Create a free Groq API account at https://console.groq.com/ and get your API key

3. Create a `.env` file with your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
```

4. Run the FastAPI application:
```bash
uvicorn backend.main:app --reload
```

### Project Structure

Organize your code in a structure similar to:

```
backend/
├── main.py          # FastAPI application and endpoints
├── models.py        # Pydantic models for request/response
├── llm.py           # Groq API integration
├── tools/           # Tool implementations
│   ├── __init__.py
│   ├── weather.py
│   ├── dealership.py
│   └── appointment.py
├── utils/           # Utility functions
│   ├── __init__.py
│   └── stream.py    # SSE streaming utilities
└── .env             # Environment variables
```

### Tool Implementation Requirements

Each tool should be implemented according to the specifications below to match what the frontend expects:

1. **get_weather**
   - Input: `city` (string)
   - Output: Weather information in a format the frontend can display

2. **get_dealership_address**
   - Input: `dealership_id` (string)
   - Output: Dealership address in a format the frontend can display

3. **check_appointment_availability**
   - Input: `dealership_id` (string), `date` (YYYY-MM-DD format)
   - Output: List of available time slots

4. **schedule_appointment**
   - Input: `user_id` (string), `dealership_id` (string), `date` (YYYY-MM-DD format), `time` (HH:MM format), `car_model` (string)
   - Output: Confirmation details

### Tool Calling with Groq API

For implementing tool calling with Groq API, refer to the official documentation at:
https://console.groq.com/docs/tool-use

The Llama 3.3 70B Versatile model supports parallel tool use and is recommended for this implementation.

### SSE Implementation

Your SSE stream should send events in the following format:

```
event: chunk
data: Some text content from the AI assistant

event: tool_use
data: get_weather

event: tool_output
data: {"name": "get_weather", "output": {"temperature": "34°C", "city": "New York"}}

event: end
data: 
```

### Testing Your Implementation

1. If using Docker Compose, your changes to the backend code will be automatically reflected
   - You can view the backend logs with `docker-compose logs -f backend`

2. If running manually, make sure your FastAPI application is running:
```bash
uvicorn backend.main:app --reload
```

3. You can test the API directly using tools like Postman or curl:
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the weather in New York?", "session_id": "test-session"}'
```

4. To test with the frontend, navigate to http://localhost:3000 in your browser

## Evaluation Criteria

Your solution will be evaluated based on:

1. **Functionality**: Does it correctly implement SSE and tool calling?
2. **Code Quality**: Is the code clean, well-organized, and maintainable?
3. **API Design**: Is the API well-designed and properly documented?
4. **Error Handling**: Does it gracefully handle errors and edge cases?
5. **Integration**: Does it work correctly with the provided frontend?

## Submission

Please submit your solution as a Git repository with:

1. Your complete backend code
2. A README explaining how to run your solution
3. Any additional documentation you think is relevant

## Tips

- Use Docker Compose for development to ensure your solution works with the frontend
- Focus on getting the SSE streaming and tool calling working first
- Test your implementation with the frontend
- Use simple mock data for tool implementations
- Implement proper error handling for a production-ready solution

Good luck! 