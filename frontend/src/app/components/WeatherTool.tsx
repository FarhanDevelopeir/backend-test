const WeatherToolOutput = ({ data }: { data: { output: string } }) => {
  // Parse temperature from output string if available
  let temperature: string | null = null;
  let location: string | null = null;
  let weatherText = data.output;
  let conditions: string | null = null;
  
  // Try to extract temperature and location using regex
  const tempMatch = data.output.match(/(\d+)°C/);
  if (tempMatch) temperature = tempMatch[1];
  
  const locationMatch = data.output.match(/in ([A-Za-z\s]+) is/);
  if (locationMatch) location = locationMatch[1];
  
  // Try to extract weather conditions
  const conditionsMatch = data.output.match(/(sunny|cloudy|rainy|snowy|clear|overcast|foggy|windy|thunderstorm|hazy)/i);
  if (conditionsMatch) conditions = conditionsMatch[1].toLowerCase();

  // Determine weather icon based on conditions or temperature
  const getWeatherIcon = () => {
    if (conditions) {
      if (conditions.includes('sunny') || conditions.includes('clear')) return '☀️';
      if (conditions.includes('cloudy') || conditions.includes('overcast')) return '☁️';
      if (conditions.includes('rainy')) return '🌧️';
      if (conditions.includes('snowy')) return '❄️';
      if (conditions.includes('foggy') || conditions.includes('hazy')) return '🌫️';
      if (conditions.includes('windy')) return '💨';
      if (conditions.includes('thunderstorm')) return '⛈️';
    }
    
    // Fallback to temperature-based icon
    const temp = parseInt(temperature || '0');
    if (temp > 30) return '☀️';
    if (temp > 20) return '⛅';
    if (temp > 10) return '🌤️';
    if (temp > 0) return '🌥️';
    return '❄️';
  };

  const getWeatherGradient = () => {
    if (conditions) {
      if (conditions.includes('sunny') || conditions.includes('clear')) 
        return 'from-amber-50 to-orange-50';
      if (conditions.includes('cloudy') || conditions.includes('overcast')) 
        return 'from-gray-50 to-slate-100';
      if (conditions.includes('rainy')) 
        return 'from-blue-50 to-indigo-100';
      if (conditions.includes('snowy')) 
        return 'from-slate-50 to-blue-100';
      if (conditions.includes('thunderstorm'))
        return 'from-indigo-50 to-purple-100';
    }
    
    // Fallback to temperature-based gradient
    const temp = parseInt(temperature || '0');
    if (temp > 30) return 'from-amber-50 to-orange-50';
    if (temp > 20) return 'from-blue-50 to-sky-50';
    if (temp > 10) return 'from-sky-50 to-indigo-50';
    if (temp > 0) return 'from-gray-50 to-slate-50';
    return 'from-blue-50 to-indigo-100';
  };

  // // Get driving recommendation based on weather
  // const getDrivingRecommendation = () => {
  //   if (conditions) {
  //     if (conditions.includes('rainy')) 
  //       return 'Perfect day to test our advanced traction control systems.';
  //     if (conditions.includes('snowy')) 
  //       return 'Experience our all-wheel drive performance today.';
  //     if (conditions.includes('sunny') && parseInt(temperature || '0') > 25) 
  //       return 'Ideal conditions to test our convertible models.';
  //     if (conditions.includes('foggy') || conditions.includes('hazy')) 
  //       return 'Our adaptive lighting systems excel in these conditions.';
  //   }
    
  //   // Temperature-based recommendation
  //   const temp = parseInt(temperature || '0');
  //   if (temp > 30) return 'Test our premium climate control systems today.';
  //   if (temp < 5) return 'Experience our heated seats and steering wheel.';
  //   return 'Perfect weather for a test drive in any of our models.';
  // };

  return (
    <div className="weather-tool overflow-hidden rounded-xl shadow-sm border border-gray-200">
      {/* Weather Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-2 px-4">
        <h3 className="font-medium text-white flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6.07" />
          </svg>
          Weather Conditions
        </h3>
      </div>
      
      {/* Weather Content */}
      <div className={`p-4 bg-gradient-to-br ${getWeatherGradient()}`}>
        <div className="flex">
          {/* Left Column: Icon and Temperature */}
          <div className="mr-4">
            <div className="weather-icon flex items-center justify-center w-16 h-16 text-4xl bg-white bg-opacity-70 rounded-full shadow-sm border border-gray-100">
              {getWeatherIcon()}
            </div>
            {temperature && (
              <div className="mt-2 text-center">
                <span className="font-bold text-2xl text-blue-800">{temperature}°</span>
                <span className="text-blue-600 text-sm">C</span>
              </div>
            )}
          </div>
          
          {/* Right Column: Location and Details */}
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-lg">
              {location ? location : 'Current Location'}
            </h4>
            <p className="text-gray-700 text-sm mt-1">{weatherText}</p>
            
          </div>
        </div>
      </div>
    </div>
  );
};


export default WeatherToolOutput;