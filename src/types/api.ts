export interface APILog {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  endpoint: string;
  headers: Record<string, string>;
  requestPayload?: any;
  responsePayload?: any;
  statusCode: number;
  responseTime: number;
  error?: string;
  userId?: string;
  userAgent?: string;
  size: number;
}

export interface APIMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; count: number; avgTime: number }>;
  statusDistribution: Record<string, number>;
  hourlyActivity: Array<{ hour: number; requests: number; errors: number }>;
}

export interface FilterOptions {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  dateRange?: { start: number; end: number };
  userId?: string;
  searchQuery?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: 'response_time' | 'error_rate' | 'status_code';
  threshold: number;
  endpoint?: string;
  enabled: boolean;
}

export interface MockResponse {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  delay?: number;
  enabled: boolean;
}