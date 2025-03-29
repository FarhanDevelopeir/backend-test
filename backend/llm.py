import os
from groq import Groq
from typing import List, Dict, Any
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

class GroqAssistant:
    def __init__(self):
        """
        Initialize Groq client with API key from environment
        """
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("Groq API key not found in environment variables")
        
        self.client = Groq(api_key=api_key)
        
        # Define available tools
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get current weather for a specified city",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "city": {
                                "type": "string", 
                                "description": "Name of the city to get weather for"
                            }
                        },
                        "required": ["city"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_dealership_address",
                    "description": "Retrieve address for a specific dealership",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "dealership_id": {
                                "type": "string", 
                                "description": "Unique identifier for the dealership"
                            }
                        },
                        "required": ["dealership_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "check_appointment_availability",
                    "description": "Check available appointment slots for a dealership on a specific date",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "dealership_id": {
                                "type": "string", 
                                "description": "Unique identifier for the dealership"
                            },
                            "date": {
                                "type": "string", 
                                "description": "Date to check availability (YYYY-MM-DD format)"
                            }
                        },
                        "required": ["dealership_id", "date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "schedule_appointment",
                    "description": "Schedule a test drive appointment",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string", 
                                "description": "Unique identifier for the user"
                            },
                            "dealership_id": {
                                "type": "string", 
                                "description": "Unique identifier for the dealership"
                            },
                            "date": {
                                "type": "string", 
                                "description": "Appointment date (YYYY-MM-DD format)"
                            },
                            "time": {
                                "type": "string", 
                                "description": "Appointment time (HH:MM format)"
                            },
                            "car_model": {
                                "type": "string", 
                                "description": "Car model for the test drive"
                            }
                        },
                        "required": ["user_id", "dealership_id", "date", "time", "car_model"]
                    }
                }
            }
        ]
    
    async def generate_response(self, messages: List[Dict[str, str]], session_id: str) -> Dict[str, Any]:
        """
        Generate a response using Groq API with tool calling support
        
        :param messages: List of message dictionaries
        :param session_id: Unique session identifier
        :return: Dictionary with response details
        """
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                stream=False  # We'll handle streaming separately
            )
            
            # Extract response details
            ai_message = response.choices[0].message

            print("ai_message",ai_message)

            # Process tool calls 
            processed_tool_calls = []
            if ai_message.tool_calls:
                for tool_call in ai_message.tool_calls:
                    tool_name = tool_call.function.name
                    
                    # Parse function arguments
                    try:
                        function_args = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        function_args = {}
                    
                    tool_output = await self._generate_tool_output(tool_name, function_args)
                    
                    processed_tool_calls.append({
                        "name": tool_name,
                        "output": tool_output
                    })
            
            return {
                "content": ai_message.content or "",
                "tool_outputs": processed_tool_calls
            }
        
        except Exception as e:
            print(f"Error in Groq API call: {e}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            print(f"Messages: {messages}")
            return {
                "content": "I apologize, but I'm unable to process your request at the moment.",
                "tool_outputs": []
            }

    async def _generate_tool_output(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """
        Generate tool outputs using actual tool implementations
        """
        from tools.weather import WeatherTool
        from tools.dealership import DealershipTool
        from tools.appointment import AppointmentTool
        
        try:
            if tool_name == "get_weather":
                result = await WeatherTool.get_weather(args.get('city', 'New York'))
                return f"The current weather in {args.get('city', 'the area')} is {result['temperature']}, {result['description']} with humidity at {result['humidity']}%."
                
            elif tool_name == "get_dealership_address":
                result = await DealershipTool.get_dealership_address(args.get('dealership_id', 'supercar_nyc'))
                if "error" in result:
                    return f"Sorry, we couldn't find information for dealership {args.get('dealership_id', '')}."
                return f"Our dealership is located at {result['address']}. You can contact us at {result['phone']}."
                
            elif tool_name == "check_appointment_availability":
                result = await AppointmentTool.check_appointment_availability(
                    args.get('dealership_id', 'LEX001'), 
                    args.get('date', datetime.now().strftime("%Y-%m-%d"))
                )
                if "error" in result:
                    return result["error"]
                available_slots = sum(1 for slot in result["slots"] if slot["available"])
                return f"We have {available_slots} available slots on {result['date']} at our {result['dealership_id']} location."
                
            elif tool_name == "schedule_appointment":
                result = await AppointmentTool.schedule_appointment(
                    args.get('user_id', 'user123'),
                    args.get('dealership_id', 'LEX001'),
                    args.get('date', datetime.now().strftime("%Y-%m-%d")),
                    args.get('time', '10:00'),
                    args.get('car_model', 'Luxury Model')
                )
                if "error" in result:
                    return result["error"]
                return f"Appointment scheduled for {result['car_model']} on {result['date']} at {result['time']}. Your booking ID is {result['booking_id']}."
            
            else:
                return f"Tool {tool_name} executed successfully."
                
        except Exception as e:
            print(f"Error executing tool {tool_name}: {e}")
            return f"There was an error executing the {tool_name} tool. Please try again."