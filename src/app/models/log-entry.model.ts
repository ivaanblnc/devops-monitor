/**
 * Log Entry Model
 * Represents a single log entry/event
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  server: string; // server name or ID
  serverId: string;
  message: string;
  details?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  ipAddress?: string;
}

/**
 * Log filter options
 */
export interface LogFilter {
  levels: ('error' | 'warn' | 'info' | 'debug')[];
  servers: string[]; // server IDs
  keyword?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Log level enum for easy reference
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log statistics
 */
export interface LogStats {
  total: number;
  byLevel: {
    error: number;
    warn: number;
    info: number;
    debug: number;
  };
  byServer: Record<string, number>;
}

/**
 * Paginated log response
 */
export interface LogResponse {
  entries: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
