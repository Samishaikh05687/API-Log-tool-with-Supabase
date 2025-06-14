import React, { useState } from 'react';
import { Play, Plus, Trash2, Copy } from 'lucide-react';
import { APILog, MockResponse } from '../types/api';

interface MockGeneratorProps {
  logs: APILog[];
}

const methodColors = {
  GET: 'bg-blue-600',
  POST: 'bg-green-600',
  PUT: 'bg-orange-600',
  DELETE: 'bg-red-600',
  PATCH: 'bg-purple-600'
} as const;

export function MockGenerator({ logs }: MockGeneratorProps) {
  const [mocks, setMocks] = useState<MockResponse[]>([]);
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMockFromLog = (log: APILog) => {
    const mock: MockResponse = {
      id: Date.now().toString(),
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      headers: log.headers,
      body: log.responsePayload,
      delay: 0,
      enabled: true
    };
    setMocks([...mocks, mock]);
  };

  const addEmptyMock = () => {
    const mock: MockResponse = {
      id: Date.now().toString(),
      endpoint: '/api/example',
      method: 'GET',
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'Mock response' },
      delay: 0,
      enabled: true
    };
    setMocks([...mocks, mock]);
  };

  const updateMock = (id: string, updates: Partial<MockResponse>) => {
    setMocks(mocks.map(mock => 
      mock.id === id ? { ...mock, ...updates } : mock
    ));
  };

  const deleteMock = (id: string) => {
    setMocks(mocks.filter(mock => mock.id !== id));
  };

  const exportMocks = () => {
    const mockServer = {
      routes: mocks.filter(mock => mock.enabled).map(mock => ({
        path: mock.endpoint,
        method: mock.method.toLowerCase(),
        status: mock.statusCode,
        headers: mock.headers,
        response: mock.body,
        delay: mock.delay
      }))
    };
    
    const dataStr = JSON.stringify(mockServer, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-server.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyMockCode = (mock: MockResponse) => {
    const code = `
// Express.js mock route
app.${mock.method.toLowerCase()}('${mock.endpoint}', (req, res) => {
  ${mock.delay > 0 ? `setTimeout(() => {` : ''}
  res.status(${mock.statusCode})
     .set(${JSON.stringify(mock.headers, null, 4)})
     .json(${JSON.stringify(mock.body, null, 4)});
  ${mock.delay > 0 ? `}, ${mock.delay});` : ''}
});
`.trim();
    
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      {/* Generate from Logs */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Generate Mocks from Logs</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).slice(0, 20).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                  methodColors[log.method as keyof typeof methodColors] || 'bg-gray-600'
                }`}>
                  {log.method}
                </span>
                <span className="text-white font-mono text-sm">{log.endpoint}</span>
                <span className="text-green-400 text-sm">{log.statusCode}</span>
              </div>
              <button
                onClick={() => generateMockFromLog(log)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Generate Mock
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Responses */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Mock Responses</h3>
          <div className="flex gap-2">
            <button
              onClick={addEmptyMock}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Mock
            </button>
            {mocks.length > 0 && (
              <button
                onClick={exportMocks}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Export Config
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {mocks.length === 0 ? (
            <p className="text-gray-400">No mock responses created yet</p>
          ) : (
            mocks.map((mock) => (
              <div key={mock.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={mock.enabled}
                      onChange={(e) => updateMock(mock.id, { enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                      methodColors[mock.method as keyof typeof methodColors] || 'bg-gray-600'
                    }`}>
                      {mock.method}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyMockCode(mock)}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMock(mock.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Endpoint
                      </label>
                      <input
                        type="text"
                        value={mock.endpoint}
                        onChange={(e) => updateMock(mock.id, { endpoint: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Method
                        </label>
                        <select
                          value={mock.method}
                          onChange={(e) => updateMock(mock.id, { method: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Status Code
                        </label>
                        <input
                          type="number"
                          value={mock.statusCode}
                          onChange={(e) => updateMock(mock.id, { statusCode: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Delay (ms)
                        </label>
                        <input
                          type="number"
                          value={mock.delay}
                          onChange={(e) => updateMock(mock.id, { delay: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Headers
                      </label>
                      <textarea
                        value={JSON.stringify(mock.headers, null, 2)}
                        onChange={(e) => {
                          try {
                            const headers = JSON.parse(e.target.value);
                            updateMock(mock.id, { headers });
                          } catch {
                            // Invalid JSON, don't update
                          }
                        }}
                        className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Response Body
                    </label>
                    <textarea
                      value={typeof mock.body === 'string' ? mock.body : JSON.stringify(mock.body, null, 2)}
                      onChange={(e) => {
                        try {
                          const body = JSON.parse(e.target.value);
                          updateMock(mock.id, { body });
                        } catch {
                          // Treat as plain string
                          updateMock(mock.id, { body: e.target.value });
                        }
                      }}
                      className="w-full h-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}