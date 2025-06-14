import { useState, useEffect } from 'react';
import { APILog, APIMetrics, FilterOptions } from '../types/api';
import { apiInterceptor } from '../utils/apiInterceptor';

export function useAPILogs() {
  const [logs, setLogs] = useState<APILog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<APILog[]>([]);
  const [metrics, setMetrics] = useState<APIMetrics | null>(null);

  useEffect(() => {
    const unsubscribe = apiInterceptor.subscribe(setLogs);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setFilteredLogs(logs);
    setMetrics(calculateMetrics(logs));
  }, [logs]);

  const filterLogs = (filters: FilterOptions) => {
    let filtered = logs;

    if (filters.endpoint) {
      filtered = filtered.filter(log => 
        log.endpoint.toLowerCase().includes(filters.endpoint!.toLowerCase())
      );
    }

    if (filters.method) {
      filtered = filtered.filter(log => log.method === filters.method);
    }

    if (filters.statusCode) {
      filtered = filtered.filter(log => log.statusCode === filters.statusCode);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(log => 
        log.timestamp >= filters.dateRange!.start && 
        log.timestamp <= filters.dateRange!.end
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.url.toLowerCase().includes(query) ||
        log.endpoint.toLowerCase().includes(query) ||
        (log.error && log.error.toLowerCase().includes(query))
      );
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    apiInterceptor.clearLogs();
  };

  const exportLogs = (format: 'json' | 'csv' | 'postman') => {
    return apiInterceptor.exportLogs(format);
  };

  return {
    logs: filteredLogs,
    allLogs: logs,
    metrics,
    filterLogs,
    clearLogs,
    exportLogs
  };
}

function calculateMetrics(logs: APILog[]): APIMetrics {
  if (logs.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
      topEndpoints: [],
      statusDistribution: {},
      hourlyActivity: []
    };
  }

  const totalRequests = logs.length;
  const successfulRequests = logs.filter(log => log.statusCode >= 200 && log.statusCode < 400).length;
  const successRate = (successfulRequests / totalRequests) * 100;
  const errorRate = ((totalRequests - successfulRequests) / totalRequests) * 100;
  const averageResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests;

  // Top endpoints
  const endpointStats = logs.reduce((acc, log) => {
    if (!acc[log.endpoint]) {
      acc[log.endpoint] = { count: 0, totalTime: 0 };
    }
    acc[log.endpoint].count++;
    acc[log.endpoint].totalTime += log.responseTime;
    return acc;
  }, {} as Record<string, { count: number; totalTime: number }>);

  const topEndpoints = Object.entries(endpointStats)
    .map(([endpoint, stats]) => ({
      endpoint,
      count: stats.count,
      avgTime: stats.totalTime / stats.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Status distribution
  const statusDistribution = logs.reduce((acc, log) => {
    const statusGroup = Math.floor(log.statusCode / 100) * 100;
    const key = `${statusGroup}s`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Hourly activity
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
    const hourLogs = logs.filter(log => new Date(log.timestamp).getHours() === hour);
    return {
      hour,
      requests: hourLogs.length,
      errors: hourLogs.filter(log => log.statusCode >= 400 || log.error).length
    };
  });

  return {
    totalRequests,
    successRate,
    averageResponseTime,
    errorRate,
    topEndpoints,
    statusDistribution,
    hourlyActivity
  };
}