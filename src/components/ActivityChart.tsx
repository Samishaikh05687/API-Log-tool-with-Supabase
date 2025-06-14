import React from 'react';

interface ActivityData {
  hour: number;
  requests: number;
  errors: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const maxRequests = Math.max(...data.map(d => d.requests));
  const maxErrors = Math.max(...data.map(d => d.errors));
  const maxValue = Math.max(maxRequests, maxErrors);

  if (maxValue === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        No activity data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400">
        <span>Requests</span>
        <span>Errors</span>
      </div>
      
      <div className="relative h-32">
        <div className="flex items-end justify-between h-full gap-1">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 h-full">
              <div className="flex flex-col justify-end h-full w-full max-w-8 gap-1">
                {/* Requests bar */}
                <div
                  className="bg-blue-500 rounded-sm min-h-1 transition-all duration-300 hover:bg-blue-400"
                  style={{
                    height: `${(item.requests / maxValue) * 100}%`
                  }}
                  title={`${item.requests} requests at ${item.hour}:00`}
                />
                {/* Errors bar */}
                <div
                  className="bg-red-500 rounded-sm min-h-1 transition-all duration-300 hover:bg-red-400"
                  style={{
                    height: `${(item.errors / maxValue) * 100}%`
                  }}
                  title={`${item.errors} errors at ${item.hour}:00`}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {item.hour.toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}