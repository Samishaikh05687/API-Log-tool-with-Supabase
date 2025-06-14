import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, RefreshCw } from 'lucide-react';
import { APILog, FilterOptions } from '../types/api';
import { LogEntry } from './LogEntry';
import { FilterPanel } from './FilterPanel';

interface LogViewerProps {
  logs: APILog[];
  onFilter: (filters: FilterOptions) => void;
  onClearLogs: () => void;
  onExport: (format: 'json' | 'csv' | 'postman') => string;
}

export function LogViewer({ logs, onFilter, onClearLogs, onExport }: LogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onFilter({ searchQuery: query });
  };

  const handleExport = (format: 'json' | 'csv' | 'postman') => {
    const data = onExport(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleExport('json')}
                className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-t-lg"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('postman')}
                className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-b-lg"
              >
                Export Postman
              </button>
            </div>
          </div>
          
          <button
            onClick={onClearLogs}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <FilterPanel onFilter={onFilter} />
      )}

      {/* Logs Count */}
      <div className="text-gray-400 text-sm">
        Showing {logs.length} logs
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No logs found</p>
            <p className="text-gray-500 text-sm mt-2">
              Make some API requests to see them logged here
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <LogEntry
              key={log.id}
              log={log}
              onClick={setSelectedLog}
              isSelected={selectedLog?.id === log.id}
            />
          ))
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {selectedLog.method} {selectedLog.endpoint}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <LogEntry log={selectedLog} expanded />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}