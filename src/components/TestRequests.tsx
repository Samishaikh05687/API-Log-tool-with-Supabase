import { useState, useEffect } from 'react';
import { Send, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Import your supabase client

interface TestRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
}

const methodColors = {
  GET: 'bg-blue-600',
  POST: 'bg-green-600',
  PUT: 'bg-orange-600',
  DELETE: 'bg-red-600',
  PATCH: 'bg-purple-600'
} as const;

export function TestRequests() {
  const [userId, setUserId] = useState<string>('');
  const [requests, setRequests] = useState<TestRequest[]>([
    {
      id: '1',
      name: 'Test GET Request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      id: '2',
      name: 'Test POST Request',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: { 'Content-Type': 'application/json' },
      body: { title: 'Test', body: 'Test content', userId: 1 }
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(requests[0]);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get user ID from Supabase auth or generate a test UUID
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          setUserId(user.id);
          console.log('Authenticated user ID:', user.id);
        } else {
          // Generate a test UUID if no user is logged in
          const testUUID = generateUUID();
          setUserId(testUUID);
          console.log('Using test UUID:', testUUID);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        // Fallback to generated UUID
        const testUUID = generateUUID();
        setUserId(testUUID);
        console.log('Fallback to test UUID:', testUUID);
      }
    };
    getUser();
  }, []);

  // Function to generate a valid UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper function to safely extract endpoint from URL
  const extractEndpoint = (url: string): string => {
    try {
      return new URL(url).pathname;
    } catch (error) {
      // If URL parsing fails, return the original URL
      return url;
    }
  };

  // Function to save API log to Supabase
  const saveApiLog = async (logData: any) => {
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .insert([logData]);

      if (error) {
        console.error('Error saving API log:', error);
      } else {
        console.log('API log saved successfully:', data);
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  };

  const executeRequest = async (request: TestRequest) => {
  if (!userId) {
    console.log('User ID not available yet, please wait...');
    return;
  }

  setIsLoading(true);
  setResponse(null);

  const startTime = Date.now();
  let fetchResponse: Response | null = null;
  let responseData: any = null;
  let error: string | null = null;

  try {
    // Prepare and sanitize headers
    const headers = new Headers();
    Object.entries(request.headers || {}).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.append(key, value);
      }
    });

    // Add default content-type if needed
    if (request.method !== 'GET' && request.body) {
      if (!headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
      }
    }

    const requestOptions: RequestInit = {
      method: request.method,
      headers,
      mode: 'cors',
      body:
        request.method !== 'GET' && request.body
          ? JSON.stringify(request.body)
          : undefined,
    };

    // Optional debug log
    console.log("Executing fetch:", request.url);
    console.log("Request options:", requestOptions);

    // Perform fetch
    fetchResponse = await fetch(request.url, requestOptions);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Parse response
    const contentType = fetchResponse.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      responseData = await fetchResponse.json();
    } else {
      responseData = await fetchResponse.text();
    }

    // Calculate size
    const responseSize = new TextEncoder().encode(
      typeof responseData === 'string'
        ? responseData
        : JSON.stringify(responseData)
    ).length;

    // Log data
    const logData = {
      user_id: userId,
      method: request.method,
      url: request.url,
      endpoint: extractEndpoint(request.url),
      headers: request.headers,
      request_payload: request.body || null,
      response_payload: responseData,
      status_code: fetchResponse.status,
      response_time: responseTime,
      error: null,
      user_agent: navigator.userAgent,
      size: responseSize,
    };

    await saveApiLog(logData);

    // Update UI response
    setResponse({
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: Object.fromEntries(fetchResponse.headers.entries()),
      data: responseData,
      responseTime,
      timestamp: Date.now(),
    });

  } catch (err) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    error = err instanceof Error ? err.message : 'Unknown error';

    const errorLogData = {
      user_id: userId,
      method: request.method,
      url: request.url,
      endpoint: extractEndpoint(request.url),
      headers: request.headers,
      request_payload: request.body || null,
      response_payload: null,
      status_code: 0,
      response_time: responseTime,
      error: error,
      user_agent: navigator.userAgent,
      size: 0,
    };

    await saveApiLog(errorLogData);

    setResponse({
      error: error,
      timestamp: Date.now(),
    });
  } finally {
    setIsLoading(false);
  }
};


  const addRequest = () => {
    const newRequest: TestRequest = {
      id: Date.now().toString(),
      name: 'New Request',
      method: 'GET',
      url: 'https://api.example.com/endpoint',
      headers: { 'Content-Type': 'application/json' }
    };
    setRequests([...requests, newRequest]);
    setSelectedRequest(newRequest);
  };

  const updateRequest = (updates: Partial<TestRequest>) => {
    if (!selectedRequest) return;
    
    const updatedRequest = { ...selectedRequest, ...updates };
    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? updatedRequest : req
    ));
    setSelectedRequest(updatedRequest);
  };

  const deleteRequest = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    if (selectedRequest?.id === id) {
      setSelectedRequest(requests.find(req => req.id !== id) || null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Request List */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Test Requests</h3>
          <button
            onClick={addRequest}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {requests.map(request => (
            <div
              key={request.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedRequest?.id === request.id
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm font-medium">{request.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                      methodColors[request.method as keyof typeof methodColors] || 'bg-gray-600'
                    }`}>
                      {request.method}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRequest(request.id);
                  }}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Editor */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-4">Request Details</h3>
        
        {selectedRequest ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={selectedRequest.name}
                onChange={(e) => updateRequest({ name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Method
                </label>
                <select
                  value={selectedRequest.method}
                  onChange={(e) => updateRequest({ method: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={selectedRequest.url}
                  onChange={(e) => updateRequest({ url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Headers
              </label>
              <textarea
                value={JSON.stringify(selectedRequest.headers, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    updateRequest({ headers });
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedRequest.method !== 'GET' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Body
                </label>
                <textarea
                  value={selectedRequest.body ? JSON.stringify(selectedRequest.body, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const body = e.target.value ? JSON.parse(e.target.value) : undefined;
                      updateRequest({ body });
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              onClick={() => executeRequest(selectedRequest)}
              disabled={isLoading || !userId}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {!userId ? 'Loading...' : isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        ) : (
          <p className="text-gray-400">Select a request to edit</p>
        )}
      </div>

      {/* Response */}
      <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Response</h3>

      {response ? (
        <div className="space-y-4">
          {response.error ? (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 mt-2">{response.error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-lg font-semibold ${
                    response.status >= 200 && response.status < 300
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="text-gray-400">
                  {response.responseTime}ms
                </span>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Headers</h4>
                <pre className="bg-gray-900 rounded p-3 text-gray-300 text-sm overflow-auto max-h-32">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Body</h4>
                <pre className="bg-gray-900 rounded p-3 text-gray-300 text-sm overflow-auto max-h-64">
                  {typeof response.data === "string"
                    ? response.data
                    : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-400">No response yet</p>
      )}

      {/* Example usage */}
      {/* 
      <button
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        onClick={() => safeFetch("https://jsonplaceholder.typicode.com/posts/1")}
      >
        Test API
      </button>
      */}
    </div>
    </div>
  );
}    