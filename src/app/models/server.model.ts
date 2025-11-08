/**
 * Server Model
 * Represents a monitored server/host in the infrastructure
 */
export interface Server {
  id: string;
  name: string;
  status: 'online' | 'warning' | 'offline';
  cpu: number; // percentage 0-100
  memory: number; // percentage 0-100
  disk: number; // percentage 0-100
  uptime: number; // days
  os: string; // e.g., "Ubuntu 22.04"
  location: string; // e.g., "us-east-1"
  ip: string; // IPv4 address
  lastPing: Date;
  networkIn: number; // MB/s
  networkOut: number; // MB/s
}

/**
 * Server creation/update payload
 */
export interface CreateServerPayload {
  name: string;
  ip: string;
  os: string;
  location: string;
}

/**
 * Server statistics
 */
export interface ServerStats {
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  warningServers: number;
  averageCpu: number;
  averageMemory: number;
  averageDisk: number;
}
