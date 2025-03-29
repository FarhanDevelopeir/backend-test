const DealershipAddressToolOutput = ({ data }: { data: { output: string } }) => {
  // Extract store hours if available in the output
  let storeHours: string | null = null;
  const hoursMatch = data.output.match(/(?:hours|open|hours of operation):\s*([^.]+)/i);
  if (hoursMatch) storeHours = hoursMatch[1].trim();
  
  // Extract phone number if available
  let phoneNumber: string | null = null;
  const phoneMatch = data.output.match(/(?:phone|call|tel|telephone):\s*([\d\s\(\)\-\+]+)/i);
  if (phoneMatch) phoneNumber = phoneMatch[1].trim();
  
  // Get address without hours and phone if they were extracted
  let addressText = data.output;
  if (storeHours) addressText = addressText.replace(new RegExp(`(?:hours|open|hours of operation):\\s*${storeHours.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i'), '');
  if (phoneNumber) addressText = addressText.replace(new RegExp(`(?:phone|call|tel|telephone):\\s*${phoneNumber.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i'), '');
  addressText = addressText.trim().replace(/\s{2,}/g, ' ');

  return (
    <div className="dealership-tool overflow-hidden rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-2 px-4">
        <h3 className="font-medium text-white flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Our Dealership Location
        </h3>
      </div>
      
      {/* Content */}
      <div className="bg-gradient-to-br from-gray-50 to-white">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            {/* Enhanced Map Placeholder with Location Pin */}
            <div className="mb-3 sm:mb-0 sm:mr-4 sm:w-1/3 rounded-lg h-32 relative overflow-hidden border border-gray-200">
              {/* Map Background */}
              <div className="absolute inset-0 bg-blue-50 bg-opacity-70">
                {/* Grid lines to simulate map */}
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
                }}></div>
              </div>
              
              {/* Location Pin */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Pin Shadow */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-400 rounded-full opacity-50"></div>
                  
                  {/* Pin Drop Animation */}
                  <div className="animate-bounce">
                    {/* Pin */}
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      
                      {/* Ripple Effect */}
                      <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border-4 border-blue-200 animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Address Details */}
            <div className="sm:w-2/3">
              <div className="flex  items-start">
                <div className="location-icon flex items-center justify-center rounded-full w-8 h-8 bg-blue-100 text-blue-700 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm mt-1">{addressText}</p>
                  
                  {/* Hours and Phone */}
                  <div className="mt-3 space-y-2">
                    {storeHours && (
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">{storeHours}</span>
                      </div>
                    )}
                    
                    {phoneNumber && (
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${phoneNumber.replace(/[^\d+]/g, '')}`} className="text-blue-600 hover:underline">
                          {phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(data.output)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
              </svg>
              Get Directions
            </a>
          
          </div>
        </div>
      </div>
    </div>
  );
};


export default DealershipAddressToolOutput;