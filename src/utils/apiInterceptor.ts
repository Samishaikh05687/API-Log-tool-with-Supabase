import { APILog } from '../types/api';

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


class APIInterceptor {
  private logs: APILog[] = [];
  private listeners: Array<(logs: APILog[]) => void> = [];
  private originalFetch: typeof fetch;

  constructor() {
    this.originalFetch = window.fetch;
    this.setupInterceptor();
    this.loadLogsFromStorage();
  }

  private setupInterceptor() {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      try {
        const response = await this.originalFetch(input, init);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responsePayload;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            responsePayload = await responseClone.json();
          } else {
            responsePayload = await responseClone.text();
          }
        } catch (error) {
          responsePayload = null;
        }

        const log: APILog = {
          id: this.generateId(),
          timestamp: startTime,
          method: method.toUpperCase(),
          url,
          endpoint: this.extractEndpoint(url),
          headers: this.headersToObject(response.headers),
          requestPayload: await this.getRequestPayload(init),
          responsePayload,
          statusCode: response.status,
          responseTime,
          userAgent: navigator.userAgent,
          size: parseInt(response.headers.get('content-length') || '0')
        };

        this.addLog(log);
        return response;
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const log: APILog = {
          id: this.generateId(),
          timestamp: startTime,
          method: method.toUpperCase(),
          url,
          endpoint: this.extractEndpoint(url),
          headers: init?.headers ? this.headersToObject(new Headers(init.headers)) : {},
          requestPayload: await this.getRequestPayload(init),
          responsePayload: null,
          statusCode: 0,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          userAgent: navigator.userAgent,
          size: 0
        };

        this.addLog(log);
        throw error;
      }
    };
  }

  private async getRequestPayload(init?: RequestInit) {
    if (!init?.body) return null;
    
    if (typeof init.body === 'string') {
      try {
        return JSON.parse(init.body);
      } catch {
        return init.body;
      }
    }
    
    return init.body;
  }

  private headersToObject(headers: Headers): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private addLog(log: APILog) {
    this.logs.unshift(log);
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }
    this.saveLogsToStorage();
    this.notifyListeners();
  }

  private saveLogsToStorage() {
    try {
      localStorage.setItem('api-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private loadLogsFromStorage() {
    try {
      const stored = localStorage.getItem('api-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  public subscribe(listener: (logs: APILog[]) => void) {
    this.listeners.push(listener);
    listener([...this.logs]);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getLogs(): APILog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.saveLogsToStorage();
    this.notifyListeners();
  }

  public exportLogs(format: 'json' | 'csv' | 'postman'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      case 'csv':
        return this.convertToCSV();
      case 'postman':
        return this.convertToPostman();
      default:
        return '';
    }
  }

  private convertToCSV(): string {
    if (this.logs.length === 0) return '';
    
    const headers = ['timestamp', 'method', 'url', 'statusCode', 'responseTime', 'error'];
    const csvData = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.method,
      log.url,
      log.statusCode,
      log.responseTime,
      log.error || ''
    ]);
    
    return [headers, ...csvData].map(row => row.join(',')).join('\n');
  }

  private convertToPostman(): string {
    const collection = {
      info: {
        name: 'API Logs Collection',
        description: 'Generated from API Logger',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: this.logs.map(log => ({
        name: `${log.method} ${log.endpoint}`,
        request: {
          method: log.method,
          header: Object.entries(log.headers).map(([key, value]) => ({ key, value })),
          url: {
            raw: log.url,
            protocol: new URL(log.url).protocol.slice(0, -1),
            host: new URL(log.url).hostname.split('.'),
            path: new URL(log.url).pathname.split('/').filter(Boolean)
          },
          body: log.requestPayload ? {
            mode: 'raw',
            raw: JSON.stringify(log.requestPayload, null, 2)
          } : undefined
        }
      }))
    };
    
    return JSON.stringify(collection, null, 2);
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const apiInterceptor = new APIInterceptor();