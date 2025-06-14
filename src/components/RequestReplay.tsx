import React, { useState } from 'react';
import { Play, Copy, Edit, Save, X } from 'lucide-react';
import { APILog } from '../types/api';

interface RequestReplayProps {
  logs: APILog[];
}

const methodColors = {
  GET: 'bg-blue-600',
  POST: 'bg-green-600',
  PUT: 'bg-orange-600',
  DELETE: 'bg-red-600',
  PATCH: 'bg-purple-600'
} as const;

export function RequestReplay({ logs }: RequestReplayProps) {
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null);
  const [editedRequest, setEditedRequest] = useState<Partial<APILog> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [replayResult, setReplayResult] = useState<any>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  const handleSelectLog = (log: APILog) => {
    setSelectedLog(log);
    setEditedRequest({
      method: log.method,
      url: log.url,
      headers: log.headers,
      requestPayload: log.requestPayload
    });
    setIsEditing(false);
    setReplayResult(null);
  };

  const handleReplay = async () => {
    if (!editedRequest) return;

    setIsReplaying(true);
    try {
      const response = await fetch(editedRequest.url!, {
        method: editedRequest.method,
        headers: editedRequest.headers,
        body: editedRequest.requestPayload ? JSON.stringify(editedRequest.requestPayload) : undefined
      });

      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      setReplayResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData,
        timestamp: Date.now()
      });
    } catch (error) {
      setReplayResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setIsReplaying(false);
    }
  };

  const copyRequest = () => {
    if (!editedRequest) return;
    
    const curlCommand = `curl -X ${editedRequest.method} '${editedRequest.url}'${
      Object.keys(editedRequest.headers || {}).length > 0 
        ? Object.entries(editedRequest.headers || {}).map(([key, value]) => ` -H '${key}: ${value}'`).join('')
        : ''
    }${
      editedRequest.requestPayload 
        ? ` -d '${JSON.stringify(editedRequest.requestPayload)}'`
        : ''
    }`;
    
    navigator.clipboard.writeText(curlCommand);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Request to Replay</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">No requests available for replay</p>
          ) : (
            logs.slice(0, 50).map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedLog?.id === log.id 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => handleSelectLog(log)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                      methodColors[log.method as keyof typeof methodColors] || 'bg-gray-600'
                    }`}>
                      {log.method}
                    </span>
                    <span className="text-white font-mono text-sm">{log.endpoint}</span>
                  </div>
                  <span className="text-gray-300 text-sm">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedLog && editedRequest && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Request Details</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isEditing 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              <button
                onClick={copyRequest}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleReplay}
                disabled={isReplaying}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isReplaying ? 'Replaying...' : 'Replay'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Method & URL</label>
              <div className="flex gap-2">
                <select
                  value={editedRequest.method}
                  onChange={(e) => setEditedRequest({ ...editedRequest, method: e.target.value })}
                  disabled={!isEditing}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <input
                  type="text"
                  value={editedRequest.url}
                  onChange={(e) => setEditedRequest({ ...editedRequest, url: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Headers</label>
              <textarea
                value={JSON.stringify(editedRequest.headers, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    setEditedRequest({ ...editedRequest, headers });
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                disabled={!isEditing}
                className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {editedRequest.requestPayload && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Request Body</label>
                <textarea
                  value={JSON.stringify(editedRequest.requestPayload, null, 2)}
                  onChange={(e) => {
                    try {
                      const payload = JSON.parse(e.target.value);
                      setEditedRequest({ ...editedRequest, requestPayload: payload });
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  disabled={!isEditing}
                  className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {replayResult && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Replay Result</h3>
          <div className="space-y-4">
            {replayResult.error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-400 font-semibold">Error</p>
                <p className="text-red-300 mt-2">{replayResult.error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    replayResult.status >= 200 && replayResult.status < 300 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {replayResult.status} {replayResult.statusText}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(replayResult.timestamp).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Response Headers</h4>
                  <pre className="bg-gray-900 rounded p-3 text-gray-300 text-sm overflow-auto">
                    {JSON.stringify(replayResult.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Response Body</h4>
                  <pre className="bg-gray-900 rounded p-3 text-gray-300 text-sm overflow-auto">
                    {typeof replayResult.data === 'string' 
                      ? replayResult.data 
                      : JSON.stringify(replayResult.data, null, 2)
                    }
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}