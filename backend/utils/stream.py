import asyncio
import json
from typing import AsyncGenerator, Dict, Any


class StreamHelper:
    @staticmethod
    async def chunked_stream(text: str, chunk_size: int = 1) -> AsyncGenerator[Dict[str, str], None]:
        """
        Generate text chunks for streaming with consistent event format
        
        :param text: Full text to stream
        :param chunk_size: Size of each chunk
        :return: Async generator of text chunks
        """
        words = text.split()
        for word in words:
            await asyncio.sleep(0.1)  # Simulate typing speed
            yield {
                "event": "chunk",
                "data": word + " "
            }

    @staticmethod
    async def stream_tool_response(tool_name: str, tool_output: Dict[str, Any]) -> AsyncGenerator[Dict[str, str], None]:
        """
        Stream tool responses with consistent formatting
        
        :param tool_name: Name of the tool used
        :param tool_output: Output from the tool
        :return: Async generator of tool response events
        """
        # Yield tool use event
        yield {
            "event": "tool_use",
            "data": tool_name
        }
        
        # Yield tool output event
        yield {
            "event": "tool_output",
            "data": json.dumps(tool_output)
        }