# SuperCar Virtual Sales Assistant - Backend Test Overview

This document provides an overview of the files and resources prepared for the backend engineer test.

## Purpose

The test evaluates a backend engineer's ability to create a FastAPI backend that:
1. Streams AI responses using Server-Sent Events (SSE)
2. Implements tool calling with Groq API using Llama 3.3 70B Versatile
3. Works with the provided frontend implementation

## Files and Resources Provided

### Core Test Documentation

- `README.md`: Main test instructions and requirements
- `TEST_OVERVIEW.md` (this file): Overview of test resources
- `ARCHITECTURE.md`: System architecture diagram and explanation

### Technical Documentation

- `docs/sse_guide.md`: Guide to implementing SSE with FastAPI

### Configuration

- `.env.example`: Example environment configuration file

## How to Use These Resources

### For Test Administrators

1. Provide the candidate with:
   - The entire `backend/` directory
   - Access to the `frontend/` directory to test their implementation

2. Evaluation guidance:
   - Verify that the candidate's solution implements all required functionality
   - Check that their code handles errors gracefully
   - Ensure their solution works with the provided frontend
   - Look for clean, well-organized code

### For Test Takers

1. Start by reading:
   - `README.md` to understand the requirements
   - `ARCHITECTURE.md` to understand the system design

2. Set up your environment:
   - Create a Groq API account at https://console.groq.com/
   - Copy `.env.example` to `.env` and add your Groq API key
   - Install the required dependencies

3. Reference materials when needed:
   - Use the Groq documentation for tool calling: https://console.groq.com/docs/tool-use
   - Use the `docs/` directory for technical guidance on SSE

4. Implementation steps:
   - Create your FastAPI application structure
   - Implement the `/query` endpoint
   - Set up SSE streaming
   - Implement tool calling with Groq API
   - Test with the provided frontend

## Expected Deliverables

1. A complete FastAPI backend that fulfills all requirements
2. Documentation explaining how to run the solution
3. Well-structured code with appropriate comments

## Evaluation Criteria

Solutions will be evaluated based on:
1. **Functionality**: Does it correctly implement SSE and tool calling?
2. **Code Quality**: Is the code clean, well-organized, and maintainable?
3. **API Design**: Is the API well-designed and properly documented?
4. **Error Handling**: Does it gracefully handle errors and edge cases?
5. **Integration**: Does it work correctly with the provided frontend?

## Time Expectations

The test is designed to take approximately 3-6 hours to complete, depending on the candidate's familiarity with the technologies involved. 