from typing import Dict, List, Any
from datetime import datetime, timedelta

class AppointmentTool:
    @staticmethod
    async def check_appointment_availability(dealership_id: str, date: str) -> Dict[str, Any]:
        """
        Check available appointment slots for a specific dealership and date
        
        Mock implementation with predefined availability
        """
        # Validate date format
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD"}
        
        # Mock availability (simulating business hours from 9am to 5pm)
        time_slots = [
            {"time": "09:00", "available": True},
            {"time": "10:00", "available": True},
            {"time": "11:00", "available": True},
            {"time": "13:00", "available": True},
            {"time": "14:00", "available": True},
            {"time": "15:00", "available": True},
            {"time": "16:00", "available": True}
        ]
        
        return {
            "dealership_id": dealership_id,
            "date": date,
            "slots": time_slots
        }
    
    @staticmethod
    async def schedule_appointment(
        user_id: str, 
        dealership_id: str, 
        date: str, 
        time: str, 
        car_model: str
    ) -> Dict[str, Any]:
        """
        Schedule a test drive appointment
        
        Mock implementation to simulate booking
        """
        # Validate inputs
        try:
            datetime.strptime(date, "%Y-%m-%d")
            datetime.strptime(time, "%H:%M")
        except ValueError:
            return {"error": "Invalid date or time format"}
        
        # Generate a mock booking confirmation
        return {
            "booking_id": f"appt_{user_id}_{dealership_id}_{date.replace('-', '')}_{time.replace(':', '')}",
            "user_id": user_id,
            "dealership_id": dealership_id,
            "date": date,
            "time": time,
            "car_model": car_model,
            "status": "confirmed"
        }