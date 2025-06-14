import React from 'react';
import { Clock, Activity } from 'lucide-react';

interface Endpoint {
  endpoint: string;
  count: number;
  avgTime: number;
}

interface TopEndpointsProps {
  endpoints: Endpoint[];
}

export function TopEndpoints({ endpoints }: TopEndpointsProps) {
  if (endpoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        No endpoint data available
      </div>
    );
  }

  const maxCount = Math.max(...endpoints.map(e => e.count));

  return (
    <div className="space-y-3">
      {endpoints.map((endpoint, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm truncate">
                {endpoint.endpoint}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Activity className="w-3 h-3" />
                <span>{endpoint.count} requests</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{endpoint.avgTime.toFixed(0)}ms avg</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(endpoint.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-gray-300 text-sm font-medium w-8 text-right">
              #{index + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}