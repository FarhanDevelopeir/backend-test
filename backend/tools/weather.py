# import httpx
# import os
# from typing import Dict, Any
# import random

# class WeatherTool:
#     @staticmethod
#     async def get_weather(city: str) -> Dict[str, Any]:
#         """
#         Fetch weather data for a given city using a mock implementation
        
#         In a real-world scenario, this would call a weather API
#         """
#         # Mock weather data for different cities
#         weather_data = {
#             "New York": {
#                 "temperature": "22°C",
#                 "description": "sunny with light clouds",
#                 "humidity": "45%",
#                 "wind": "10 mph"
#             },
#             "Los Angeles": {
#                 "temperature": "28°C",
#                 "description": "clear and warm",
#                 "humidity": "35%",
#                 "wind": "5 mph"
#             },
#             "Chicago": {
#                 "temperature": "18°C",
#                 "description": "partly cloudy",
#                 "humidity": "55%",
#                 "wind": "15 mph"
#             },
#             "Miami": {
#                 "temperature": "30°C",
#                 "description": "sunny and humid",
#                 "humidity": "75%",
#                 "wind": "8 mph"
#             },
#             "Seattle": {
#                 "temperature": "15°C",
#                 "description": "rainy",
#                 "humidity": "80%",
#                 "wind": "12 mph"
#             },
#             "Denver": {
#                 "temperature": "20°C",
#                 "description": "clear and dry",
#                 "humidity": "30%",
#                 "wind": "7 mph"
#             }
#         }
        
#         # Normalize city name
#         city = city.title()
        
#         # Generate random weather data for cities not in our mock database
#         if city not in weather_data:
#             conditions = ["sunny", "cloudy", "rainy", "partly cloudy", "clear", "overcast", "foggy"]
#             temperature = random.randint(10, 35)
#             humidity = random.randint(30, 90)
#             wind = random.randint(5, 20)
            
#             return {
#                 "temperature": f"{temperature}°C",
#                 "description": random.choice(conditions),
#                 "humidity": f"{humidity}%",
#                 "wind": f"{wind} mph"
#             }
        
#         return weather_data[city]

import httpx
import os
from typing import Dict, Any
from dotenv import load_dotenv

class WeatherTool:
    @staticmethod
    async def get_weather(city: str) -> Dict[str, Any]:
        """
        Fetch real-time weather data for a given city using OpenWeatherMap API
        
        Requires OPENWEATHERMAP_API_KEY in environment variables
        """
        # Load environment variables
        load_dotenv()
        
        # Get API key from environment variables
        api_key = os.getenv("OPENWEATHERMAP_API_KEY")
        
        if not api_key:
            return {
                "error": "OpenWeatherMap API key not found. Please set OPENWEATHERMAP_API_KEY in your environment."
            }
        
        # OpenWeatherMap API endpoint
        base_url = "https://api.openweathermap.org/data/2.5/weather"
        
        try:
            async with httpx.AsyncClient() as client:
                # Make API request
                response = await client.get(
                    base_url, 
                    params={
                        "q": city,
                        "appid": api_key,
                        "units": "metric"  # Use Celsius
                    }
                )
                
                # Check if request was successful
                response.raise_for_status()
                
                # Parse JSON response
                data = response.json()
                
                # Extract relevant weather information
                return {
                    "temperature": f"{round(data['main']['temp'])}°C",
                    "description": data['weather'][0]['description'],
                    "humidity": f"{data['main']['humidity']}%",
                    "wind": f"{round(data['wind']['speed'], 1)} mph",
                    "location": f"{data['name']}, {data.get('sys', {}).get('country', '')}"
                }
        
        except httpx.RequestError as e:
            # Handle network-related errors
            return {
                "error": f"Network error occurred: {str(e)}"
            }
        
        except httpx.HTTPStatusError as e:
            # Handle HTTP errors (like city not found)
            if e.response.status_code == 404:
                return {
                    "error": f"City '{city}' not found. Please check the city name."
                }
            return {
                "error": f"HTTP error occurred: {str(e)}"
            }
        
        except KeyError as e:
            # Handle unexpected API response structure
            return {
                "error": f"Unable to parse weather data: {str(e)}"
            }
        
        except Exception as e:
            # Catch any other unexpected errors
            return {
                "error": f"An unexpected error occurred: {str(e)}"
            }