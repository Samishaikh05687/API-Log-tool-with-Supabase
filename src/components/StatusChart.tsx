import React from 'react';

interface StatusChartProps {
  data: Record<string, number>;
}

const statusColors = {
  '200s': 'bg-green-500',
  '300s': 'bg-blue-500',
  '400s': 'bg-orange-500',
  '500s': 'bg-red-500'
};

export function StatusChart({ data }: StatusChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        No status data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([status, count]) => {
        const percentage = (count / total) * 100;
        const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-500';
        
        return (
          <div key={status} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{status}</span>
              <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}