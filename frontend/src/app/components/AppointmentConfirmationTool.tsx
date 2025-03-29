const AppointmentConfirmationToolOutput = ({ data }: { data: { output: string | any } }) => {
    // Extract details if available
    let dateTime = '';
    let date = '';
    let time = '';
    let carModel = '';
    let confirmationId = '';
    let message = '';
    
    if (typeof data.output === 'string') {
      // Check for markdown code block with backticks pattern for Python-style dict
      const codeBlockRegex = /```\s*\{(.+)\}\s*```/s;
      const codeBlockMatch = data.output.match(codeBlockRegex);
      
      if (codeBlockMatch) {
        // Manual parsing approach - more reliable than JSON.parse for this format
        const dictContent = codeBlockMatch[1];
        
        // Extract key-value pairs using regex
        const keyValueRegex = /'([^']+)':\s*'([^']*)'/g;
        let match;
        
        while ((match = keyValueRegex.exec(dictContent)) !== null) {
          const key = match[1];
          const value = match[2];
          
          // Map to appropriate fields
          if (key === 'confirmacion_id' || key === 'confirmation_id') {
            confirmationId = value;
          } else if (key === 'fecha' || key === 'date') {
            date = value;
          } else if (key === 'hora' || key === 'time') {
            time = value;
          } else if (key === 'modelo' || key === 'model') {
            carModel = value;
          } else if (key === 'mensaje' || key === 'message') {
            message = value;
          }
        }
        
        // If the above regex didn't work, try an alternative approach
        if (!confirmationId && !date && !time && !carModel && !message) {
          try {
            // Split by commas and manually parse each key-value pair
            const pairs = dictContent.split(',').map(pair => pair.trim());
            
            pairs.forEach(pair => {
              // Extract key and value
              const colonIndex = pair.indexOf(':');
              if (colonIndex > 0) {
                let key = pair.substring(0, colonIndex).trim();
                let value = pair.substring(colonIndex + 1).trim();
                
                // Remove quotes
                key = key.replace(/^'|'$/g, '');
                value = value.replace(/^'|'$/g, '');
                
                // Map to appropriate fields
                if (key === 'confirmacion_id' || key === 'confirmation_id') {
                  confirmationId = value;
                } else if (key === 'fecha' || key === 'date') {
                  date = value;
                } else if (key === 'hora' || key === 'time') {
                  time = value;
                } else if (key === 'modelo' || key === 'model') {
                  carModel = value;
                } else if (key === 'mensaje' || key === 'message') {
                  message = value;
                }
              }
            });
          } catch (e) {
            console.error('Error in fallback parsing:', e);
          }
        }
        
        // Format the dateTime from separate date and time
        if (date && time) {
          dateTime = `${date} at ${time}`;
        } else if (date) {
          dateTime = date;
        } else if (time) {
          dateTime = time;
        }
      } else {
        // Try other formats
        const dateMatch = data.output.match(/(\d{1,2}(\/|\.)\d{1,2}(\/|\.)\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?, \d{4})(?: at )?(?: |, )?(\d{1,2}:\d{2}(?: AM| PM)?)/i);
        if (dateMatch) {
          date = dateMatch[1];
          time = dateMatch[4] || '';
          dateTime = `${date} ${time}`;
        }
        
        const confirmMatch = data.output.match(/confirmation (?:id|number|code): ([A-Z0-9-]+)/i);
        if (confirmMatch) {
          confirmationId = confirmMatch[1];
        }
        
        // Try to extract model or car information
        const modelMatch = data.output.match(/(?:car|model|vehicle):\s*([^\n,\.]+)/i);
        if (modelMatch) {
          carModel = modelMatch[1].trim();
        }
      }
    } else if (typeof data.output === 'object') {
      // Handle when output is already an object
      const output = data.output;
      date = output.date || output.fecha || '';
      time = output.time || output.hora || '';
      dateTime = date && time ? `${date} at ${time}` : date || time;
      carModel = output.model || output.modelo || output.carModel || '';
      confirmationId = output.confirmationId || output.confirmation_id || '';
      message = output.message || output.mensaje || '';
    }
  
    // Generate calendar event file
    const handleAddToCalendar = () => {
      try {
        // Default values if we can't parse the date/time
        let startDate = new Date();
        let endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
        
        // Try to parse the date and time
        if (date) {
          // Handle different date formats
          if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(date)) {
            // MM/DD/YYYY format
            const [month, day, year] = date.split('/').map(num => parseInt(num));
            startDate = new Date(year, month - 1, day);
          } else if (/\d{4}-\d{1,2}-\d{1,2}/.test(date)) {
            // YYYY-MM-DD format
            const [year, month, day] = date.split('-').map(num => parseInt(num));
            startDate = new Date(year, month - 1, day);
          } else if (/\d{1,2}-\d{1,2}-\d{4}/.test(date)) {
            // DD-MM-YYYY format
            const [day, month, year] = date.split('-').map(num => parseInt(num));
            startDate = new Date(year, month - 1, day);
          } else {
            // Try to parse day names like "Friday"
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayIndex = dayNames.findIndex(day => date.toLowerCase().includes(day));
            
            if (dayIndex !== -1) {
              // Find the next occurrence of this day
              const today = new Date();
              const currentDayIndex = today.getDay();
              const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;
              startDate = new Date(today);
              startDate.setDate(today.getDate() + daysToAdd);
            }
          }
        }
        
        // Add time if available
        if (time) {
          const timeMatch = time.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const ampm = timeMatch[3]?.toUpperCase();
            
            // Adjust hours for PM
            if (ampm === 'PM' && hours < 12) {
              hours += 12;
            } else if (ampm === 'AM' && hours === 12) {
              hours = 0;
            }
            
            startDate.setHours(hours, minutes, 0, 0);
          }
        }
        
        // Set end time 1 hour after start time
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        // Format dates for iCalendar
        const formatDateForIcal = (date: Date) => {
          return date.toISOString().replace(/-|:|\.\d+/g, '');
        };
        
        // Create iCalendar content
        const calendarContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//SuperCar//Test Drive Appointment//EN',
          'CALSCALE:GREGORIAN',
          'BEGIN:VEVENT',
          `DTSTART:${formatDateForIcal(startDate)}`,
          `DTEND:${formatDateForIcal(endDate)}`,
          `SUMMARY:Test Drive - ${carModel || 'SuperCar'}`,
          `DESCRIPTION:Confirmation ID: ${confirmationId || 'N/A'}\\n${message || 'Your test drive appointment'}`,
          'LOCATION:SuperCar Dealership',
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'BEGIN:VALARM',
          'TRIGGER:-PT1H',
          'ACTION:DISPLAY',
          'DESCRIPTION:Reminder',
          'END:VALARM',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');
        
        // Create a blob and download link
        const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Create a download link and trigger it
        const link = document.createElement('a');
        link.href = url;
        link.download = `SuperCar_TestDrive_${confirmationId || 'Appointment'}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Error creating calendar event:', e);
        alert('Sorry, there was an error creating the calendar event. Please try again.');
      }
    };
  
    return (
      <div className="confirmation-tool overflow-hidden rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-2 px-4">
          <h3 className="font-medium text-white flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </h3>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-blue-50 to-white">
          {/* Success Icon */}
          {/* <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div> */}
          
          {/* Confirmation Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* <h4 className="text-lg font-semibold text-blue-900 text-center mb-4">{message}</h4> */}
            
            <div className="space-y-3">
              {confirmationId && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Confirmation Code</p>
                    <p className="font-medium text-gray-800">{confirmationId}</p>
                  </div>
                </div>
              )}
              
              {dateTime && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-800">{dateTime}</p>
                  </div>
                </div>
              )}
              
              {carModel && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-5l-3-4V4a1 1 0 00-1-1H3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="font-medium text-gray-800">{carModel}</p>
                  </div>
                </div>
              )}
              
         
              
              {!dateTime && !carModel && !confirmationId && !message && typeof data.output === 'string' && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Details</p>
                    <p className="font-medium text-gray-800">{data.output}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* What's Next Section */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              What's Next
            </h5>
            <p className="text-sm text-gray-700 mb-3">
              You'll receive a confirmation email shortly with all the details. Our team is looking forward to meeting you.
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={handleAddToCalendar}
                className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add to Calendar
              </button>
  
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AppointmentConfirmationToolOutput;
  