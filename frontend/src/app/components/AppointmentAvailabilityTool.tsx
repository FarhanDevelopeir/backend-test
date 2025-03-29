const AppointmentAvailabilityToolOutput = ({ data }: { data: { output: string | any } }) => {
  // Handle when output is a string vs an object with times
  let timeSlots: string[] = [];
  
  if (typeof data.output === 'string') {
    // Check for markdown code block with backticks pattern
    const codeBlockRegex = /```\s*\[(.+)\]\s*```/;
    const codeBlockMatch = data.output.match(codeBlockRegex);
    
    if (codeBlockMatch) {
      // Extract the array content from inside the code block
      try {
        // Parse the string representation of an array
        const arrayString = '[' + codeBlockMatch[1] + ']';
        const parsedArray = JSON.parse(arrayString.replace(/'/g, '"'));
        if (Array.isArray(parsedArray)) {
          timeSlots = parsedArray;
        }
      } catch (e) {
        console.error('Error parsing array from code block:', e);
        // If parsing fails, try to split the raw content
        const rawArray = codeBlockMatch[1];
        timeSlots = rawArray.split(',').map(item => item.trim().replace(/'/g, ''));
      }
    } else {
      // Try other formats
      try {
        // Check if the string is a JSON string representation of an array
        if (data.output.trim().startsWith('[') && data.output.trim().endsWith(']')) {
          const parsedArray = JSON.parse(data.output.replace(/'/g, '"'));
          if (Array.isArray(parsedArray)) {
            timeSlots = parsedArray;
          }
        } else {
          // Try to extract time slots using other patterns
          const availableTimesMatch = data.output.match(/available times?: (.*?)(?:$|\.)/i);
          if (availableTimesMatch) {
            timeSlots = availableTimesMatch[1].split(',').map(slot => slot.trim());
          }
        }
      } catch (e) {
        console.error('Error parsing appointment times:', e);
      }
    }
    
    // If we still have no time slots, just display the raw output
    if (timeSlots.length === 0) {
      return (
        <div className="appointment-tool overflow-hidden rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-2 px-4">
            <h3 className="font-medium text-white flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointment Information
            </h3>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-start">
              <div className="calendar-icon flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Appointment Scheduling</h4>
                <p className="text-gray-700 text-sm mt-1">{data.output}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  } else if (data.output && data.output.availableTimes) {
    timeSlots = data.output.availableTimes;
  } else if (Array.isArray(data.output)) {
    timeSlots = data.output;
  }

  // Format the time slots to ensure they look like proper times
  const formattedTimeSlots = timeSlots.map(slot => slot.trim());

  return (
    <div className="appointment-tool overflow-hidden rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-2 px-4">
        <h3 className="font-medium text-white flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Available Appointments
        </h3>
      </div>
      
      <div className="p-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-start mb-4">
          <div className="calendar-icon flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-5l-3-4V4a1 1 0 00-1-1H3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Appointments</h4>
            <p className="text-gray-600 text-sm">we have following time slot available</p>
          </div>
        </div>
        
        {formattedTimeSlots.length > 0 ? (
          <div className="time-slots grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {formattedTimeSlots.map((slot, index) => (
              <div 
                key={index} 
                className="time-slot bg-white py-2 px-3 rounded-lg border border-blue-100 text-center text-blue-800 hover:bg-blue-50 cursor-default transition-colors shadow-sm"
              >
                {slot}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700 text-sm bg-white p-3 rounded-lg border border-blue-100">No available slots found.</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentAvailabilityToolOutput;