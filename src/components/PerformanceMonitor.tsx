import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { APILog, AlertRule } from '../types/api';

interface PerformanceMonitorProps {
  logs: APILog[];
}

interface PerformanceMetric {
  endpoint: string;
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  trend: 'up' | 'down' | 'stable';
}

export function PerformanceMonitor({ logs }: PerformanceMonitorProps) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  useEffect(() => {
    calculatePerformanceMetrics();
    checkAlerts();
  }, [logs, alerts]);

  const calculatePerformanceMetrics = () => {
    const endpointStats = logs.reduce((acc, log) => {
      if (!acc[log.endpoint]) {
        acc[log.endpoint] = {
          times: [],
          errors: 0,
          total: 0
        };
      }
      
      acc[log.endpoint].times.push(log.responseTime);
      acc[log.endpoint].total++;
      
      if (log.statusCode >= 400 || log.error) {
        acc[log.endpoint].errors++;
      }
      
      return acc;
    }, {} as Record<string, { times: number[], errors: number, total: number }>);

    const metrics = Object.entries(endpointStats).map(([endpoint, stats]) => {
      const avgResponseTime = stats.times.reduce((sum, time) => sum + time, 0) / stats.times.length;
      const errorRate = (stats.errors / stats.total) * 100;
      
      // Simple trend calculation (last 10 vs previous 10)
      const recent = stats.times.slice(-10);
      const previous = stats.times.slice(-20, -10);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (recent.length > 0 && previous.length > 0) {
        const recentAvg = recent.reduce((sum, time) => sum + time, 0) / recent.length;
        const previousAvg = previous.reduce((sum, time) => sum + time, 0) / previous.length;
        
        if (recentAvg > previousAvg * 1.1) trend = 'up';
        else if (recentAvg < previousAvg * 0.9) trend = 'down';
      }

      return {
        endpoint,
        avgResponseTime,
        errorRate,
        requestCount: stats.total,
        trend
      };
    }).sort((a, b) => b.requestCount - a.requestCount);

    setPerformanceMetrics(metrics);
  };

  const checkAlerts = () => {
    const newActiveAlerts: string[] = [];

    alerts.forEach(alert => {
      if (!alert.enabled) return;

      const relevantLogs = alert.endpoint 
        ? logs.filter(log => log.endpoint === alert.endpoint)
        : logs;

      switch (alert.condition) {
        case 'response_time': {
          const recentLogs = relevantLogs.slice(0, 10);
          const avgTime = recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length;
          if (avgTime > alert.threshold) {
            newActiveAlerts.push(alert.id);
          }
          break;
        }
        case 'error_rate': {
          const recentLogs = relevantLogs.slice(0, 100);
          const errorCount = recentLogs.filter(log => log.statusCode >= 400 || log.error).length;
          const errorRate = (errorCount / recentLogs.length) * 100;
          if (errorRate > alert.threshold) {
            newActiveAlerts.push(alert.id);
          }
          break;
        }
        case 'status_code': {
          const recentLogs = relevantLogs.slice(0, 10);
          if (recentLogs.some(log => log.statusCode === alert.threshold)) {
            newActiveAlerts.push(alert.id);
          }
          break;
        }
      }
    });

    setActiveAlerts(newActiveAlerts);
  };

  const addAlert = () => {
    const newAlert: AlertRule = {
      id: Date.now().toString(),
      name: 'New Alert',
      condition: 'response_time',
      threshold: 1000,
      enabled: true
    };
    setAlerts([...alerts, newAlert]);
  };

  const updateAlert = (id: string, updates: Partial<AlertRule>) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-semibold">Active Alerts</h3>
          </div>
          <div className="space-y-2">
            {activeAlerts.map(alertId => {
              const alert = alerts.find(a => a.id === alertId);
              return alert ? (
                <div key={alertId} className="text-red-300">
                  {alert.name}: {alert.condition} threshold exceeded
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="space-y-3">
          {performanceMetrics.length === 0 ? (
            <p className="text-gray-400">No performance data available</p>
          ) : (
            performanceMetrics.map((metric, index) => (
              <div key={metric.endpoint} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm truncate">
                      {metric.endpoint}
                    </span>
                    {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                    {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>{metric.requestCount} requests</span>
                    <span>{metric.avgResponseTime.toFixed(0)}ms avg</span>
                    <span className={metric.errorRate > 5 ? 'text-red-400' : 'text-gray-400'}>
                      {metric.errorRate.toFixed(1)}% errors
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.avgResponseTime > 1000 ? 'bg-red-500' :
                        metric.avgResponseTime > 500 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((metric.avgResponseTime / 2000) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm w-12 text-right">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Alert Rules</h3>
          <button
            onClick={addAlert}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Alert
          </button>
        </div>
        
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-gray-400">No alert rules configured</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={(e) => updateAlert(alert.id, { enabled: e.target.checked })}
                    className="rounded"
                  />
                  
                  <input
                    type="text"
                    value={alert.name}
                    onChange={(e) => updateAlert(alert.id, { name: e.target.value })}
                    className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  
                  <select
                    value={alert.condition}
                    onChange={(e) => updateAlert(alert.id, { condition: e.target.value as any })}
                    className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  >
                    <option value="response_time">Response Time</option>
                    <option value="error_rate">Error Rate</option>
                    <option value="status_code">Status Code</option>
                  </select>
                  
                  <input
                    type="number"
                    value={alert.threshold}
                    onChange={(e) => updateAlert(alert.id, { threshold: parseFloat(e.target.value) })}
                    className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  
                  <input
                    type="text"
                    placeholder="Endpoint (optional)"
                    value={alert.endpoint || ''}
                    onChange={(e) => updateAlert(alert.id, { endpoint: e.target.value || undefined })}
                    className="w-32 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
                
                {activeAlerts.includes(alert.id) && (
                  <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                    <Bell className="w-3 h-3" />
                    <span>Alert triggered!</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}