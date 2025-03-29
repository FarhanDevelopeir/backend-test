'use client';

import React from 'react';
import WeatherToolOutput from './WeatherTool';
import DealershipAddressToolOutput from './DealershipAddressTool';
import AppointmentAvailabilityToolOutput from './AppointmentAvailabilityTool';
import AppointmentConfirmationToolOutput from './AppointmentConfirmationTool';



// Tool Output Container that renders the appropriate component based on the tool name
export const ToolOutputContainer = ({ toolName, data }: { toolName: string, data: any }) => {
  console.log('ToolOutputContainer received:', { toolName, data });
  
  switch (toolName) {
    case 'get_weather':
      console.log('Rendering WeatherToolOutput');
      return <WeatherToolOutput data={data} />;
    case 'get_dealership_address':
      console.log('Rendering DealershipAddressToolOutput');
      return <DealershipAddressToolOutput data={data} />;
    case 'check_appointment_availability':
      console.log('Rendering AppointmentAvailabilityToolOutput');
      return <AppointmentAvailabilityToolOutput data={data} />;
    case 'schedule_appointment':
      console.log('Rendering AppointmentConfirmationToolOutput');
      return <AppointmentConfirmationToolOutput data={data} />;
    default:
      console.log('Rendering generic tool output for:', toolName);
      return (
        <div className="generic-tool bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-800">Tool Output: {toolName}</h3>
          <pre className="text-sm text-gray-700 mt-2 whitespace-pre-wrap overflow-x-auto">
            {typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2)}
          </pre>
        </div>
      );
  }
};