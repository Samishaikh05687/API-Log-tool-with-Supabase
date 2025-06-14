import React from 'react';
import { Clock, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { APILog } from '../types/api';

interface LogEntryProps {
  log: APILog;
  onClick?: (log: APILog) => void;
  isSelected?: boolean;
  expanded?: boolean;
}

const methodColors = {
  GET: 'bg-blue-600',
  POST: 'bg-green-600',
  PUT: 'bg-orange-600',
  DELETE: 'bg-red-600',
  PATCH: 'bg-purple-600'
};

const statusColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-orange-400'
};

export function LogEntry({ log, onClick, isSelected, expanded }: LogEntryProps) {
  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return statusColors.success;
    if (statusCode >= 400) return statusColors.error;
    return statusColors.warning;
  };

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="w-4 h-4" />;
    if (statusCode >= 400 || log.error) return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (obj: any) => {
    if (!obj) return 'null';
    if (typeof obj === 'string') return obj;
    return JSON.stringify(obj, null, 2);
  };

  if (expanded) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${methodColors[log.method as keyof typeof methodColors] || 'bg-gray-600'}`}>
            {log.method}
          </span>
          <span className={`flex items-center gap-1 ${getStatusColor(log.statusCode)}`}>
            {getStatusIcon(log.statusCode)}
            {log.statusCode || 'Error'}
          </span>
          <span className="text-gray-400 text-sm">
            {log.responseTime}ms
          </span>
          <span className="text-gray-400 text-sm">
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>

        {/* URL */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold">Request URL</h4>
          <div className="bg-gray-900 rounded p-3 flex items-center justify-between">
            <code className="text-green-400 font-mono text-sm">{log.url}</code>
            <button
              onClick={() => copyToClipboard(log.url)}
              className="text-gray-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold">Headers</h4>
          <div className="bg-gray-900 rounded p-3">
            <pre className="text-gray-300 text-sm overflow-auto">
              {formatJson(log.headers)}
            </pre>
          </div>
        </div>

        {/* Request Payload */}
        {log.requestPayload && (
          <div className="space-y-2">
            <h4 className="text-white font-semibold">Request Body</h4>
            <div className="bg-gray-900 rounded p-3">
              <pre className="text-gray-300 text-sm overflow-auto">
                {formatJson(log.requestPayload)}
              </pre>
            </div>
          </div>
        )}

        {/* Response Payload */}
        {log.responsePayload && (
          <div className="space-y-2">
            <h4 className="text-white font-semibold">Response Body</h4>
            <div className="bg-gray-900 rounded p-3">
              <pre className="text-gray-300 text-sm overflow-auto">
                {formatJson(log.responsePayload)}
              </pre>
            </div>
          </div>
        )}

        {/* Error */}
        {log.error && (
          <div className="space-y-2">
            <h4 className="text-red-400 font-semibold">Error</h4>
            <div className="bg-red-900/20 border border-red-700 rounded p-3">
              <p className="text-red-400 text-sm">{log.error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-gray-800 rounded-lg border cursor-pointer transition-all hover:bg-gray-750 ${
        isSelected ? 'border-blue-500 bg-gray-750' : 'border-gray-700'
      }`}
      onClick={() => onClick?.(log)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${methodColors[log.method as keyof typeof methodColors] || 'bg-gray-600'}`}>
            {log.method}
          </span>
          
          <span className="text-white font-mono text-sm truncate flex-1">
            {log.endpoint}
          </span>
          
          <span className={`flex items-center gap-1 ${getStatusColor(log.statusCode)}`}>
            {getStatusIcon(log.statusCode)}
            {log.statusCode || 'Error'}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{log.responseTime}ms</span>
          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
      
      {log.error && (
        <div className="mt-2 text-red-400 text-sm">
          Error: {log.error}
        </div>
      )}
    </div>
  );
}