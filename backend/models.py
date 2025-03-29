from pydantic import BaseModel, Field
from typing import Optional, List

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, 
                       description="User's input query")
    session_id: str = Field(..., min_length=1, max_length=100, 
                            description="Unique identifier for the conversation session")

class ToolOutput(BaseModel):
    name: str
    output: dict

class WeatherData(BaseModel):
    temperature: str
    city: str
    description: Optional[str] = None
    humidity: Optional[int] = None

class DealershipAddress(BaseModel):
    id: str
    name: str
    address: str
    phone: Optional[str] = None

class AppointmentSlot(BaseModel):
    time: str
    available: bool

class AppointmentBookingRequest(BaseModel):
    user_id: str
    dealership_id: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    car_model: str