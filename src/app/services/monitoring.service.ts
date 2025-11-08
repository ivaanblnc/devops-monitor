import {
  Injectable,
  signal,
  computed,
  effect,
  Signal,
} from '@angular/core';
import { Server, ServerStats, CreateServerPayload } from '../models/server.model';
import { Metric } from '../models/metric.model';
import { Alert } from '../models/alert.model';
import { LogEntry, LogFilter, LogResponse } from '../models/log-entry.model';
import { ChartData, TimeRange } from '../models/chart-data.model';

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  // ═══════════════════════════════════════════════════════════════════
  // SIGNALS - REACTIVE STATE
  // ═══════════════════════════════════════════════════════════════════

  servers = signal<Server[]>([]);
  metrics = signal<Metric[]>([]);
  alerts = signal<Alert[]>([]);
  logs = signal<LogEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED VALUES - DERIVED STATE
  // ═══════════════════════════════════════════════════════════════════

  serverStats = computed<ServerStats>(() => {
    const allServers = this.servers();
    const onlineCount = allServers.filter((s) => s.status === 'online').length;
    const offlineCount = allServers.filter((s) => s.status === 'offline').length;
    const warningCount = allServers.filter((s) => s.status === 'warning').length;

    const avgCpu =
      allServers.length > 0
        ? allServers.reduce((sum, s) => sum + s.cpu, 0) / allServers.length
        : 0;
    const avgMemory =
      allServers.length > 0
        ? allServers.reduce((sum, s) => sum + s.memory, 0) / allServers.length
        : 0;
    const avgDisk =
      allServers.length > 0
        ? allServers.reduce((sum, s) => sum + s.disk, 0) / allServers.length
        : 0;

    return {
      totalServers: allServers.length,
      onlineServers: onlineCount,
      offlineServers: offlineCount,
      warningServers: warningCount,
      averageCpu: Math.round(avgCpu * 10) / 10,
      averageMemory: Math.round(avgMemory * 10) / 10,
      averageDisk: Math.round(avgDisk * 10) / 10,
    };
  });

  activeAlerts = computed<Alert[]>(() =>
    this.alerts().filter((a) => a.active)
  );

  criticalAlerts = computed<Alert[]>(() =>
    this.alerts().filter((a) => a.severity === 'critical' && a.active)
  );

  // ═══════════════════════════════════════════════════════════════════
  // CONSTRUCTOR & INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  constructor() {
    this.initializeMockData();
    this.setupRealtimeSimulation();
  }

  /**
   * Initialize with mock data
   */
  private initializeMockData(): void {
    this.servers.set(this.generateMockServers(30));
    this.metrics.set(this.generateMockMetrics());
    this.alerts.set(this.generateMockAlerts());
    this.logs.set(this.generateMockLogs());
  }

  /**
   * Setup real-time simulation with periodic updates
   */
  private setupRealtimeSimulation(): void {
    setInterval(() => {
      this.simulateServerUpdates();
    }, 3000); // Update every 3 seconds

    setInterval(() => {
      this.addSimulatedLog();
    }, 4000); // Add log every 4 seconds
  }

  /**
   * Simulate server metric updates
   */
  private simulateServerUpdates(): void {
    this.servers.update((servers) =>
      servers.map((server) => ({
        ...server,
        cpu: Math.max(0, Math.min(100, server.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, server.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, server.disk + (Math.random() - 0.5) * 2)),
        networkIn: Math.max(0, server.networkIn + (Math.random() - 0.5) * 50),
        networkOut: Math.max(0, server.networkOut + (Math.random() - 0.5) * 50),
        lastPing: new Date(),
      }))
    );
  }

  /**
   * Add simulated log entry
   */
  private addSimulatedLog(): void {
    const servers = this.servers();
    if (servers.length === 0) return;

    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    const levels = ['info', 'warn', 'error', 'debug'] as const;
    const messages = [
      'Connection established',
      'Request processed successfully',
      'Database query executed',
      'Cache hit for key',
      'Warning: Memory usage above 85%',
      'Error: Request timeout',
      'API response time exceeded',
    ];

    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level: levels[Math.floor(Math.random() * levels.length)],
      server: randomServer.name,
      serverId: randomServer.id,
      message: messages[Math.floor(Math.random() * messages.length)],
      metadata: {
        duration: Math.floor(Math.random() * 1000),
        statusCode: Math.floor(Math.random() * 200) + 200,
      },
    };

    this.logs.update((logs) => [newLog, ...logs.slice(0, 199)]);
  }

  /**
   * Generate mock servers
   */
  private generateMockServers(count: number = 12): Server[] {
    const serverNames = [
      'prod-web-01',
      'prod-web-02',
      'prod-web-03',
      'prod-web-04',
      'prod-api-01',
      'prod-api-02',
      'prod-api-03',
      'db-master-01',
      'db-slave-01',
      'db-slave-02',
      'cache-redis-01',
      'cache-redis-02',
      'queue-worker-01',
      'queue-worker-02',
      'queue-worker-03',
      'queue-worker-04',
      'load-balancer-01',
      'cdn-edge-01',
      'cdn-edge-02',
      'monitoring-01',
      'logging-01',
      'storage-01',
      'backup-01',
      'staging-web-01',
      'staging-api-01',
      'dev-web-01',
      'dev-api-01',
      'dev-db-01',
      'firewall-01',
      'dns-01',
    ];

    const locations = ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'ca-central-1', 'us-west-2'];
    const osNames = ['Ubuntu 22.04', 'Debian 11', 'CentOS 9', 'Alpine 3.18'];

    return serverNames.slice(0, count).map((name, index) => ({
      id: `server-${index + 1}`,
      name,
      status: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'offline' : 'warning') : 'online',
      cpu: Math.random() * 80 + 10,
      memory: Math.random() * 70 + 15,
      disk: Math.random() * 60 + 20,
      uptime: Math.floor(Math.random() * 365) + 1,
      os: osNames[Math.floor(Math.random() * osNames.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      lastPing: new Date(),
      networkIn: Math.random() * 200,
      networkOut: Math.random() * 150,
    }));
  }

  /**
   * Generate mock metrics
   */
  private generateMockMetrics(): Metric[] {
    const servers = this.servers();
    const avgCpu = servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length || 0;
    const avgMemory = servers.reduce((sum, s) => sum + s.memory, 0) / servers.length || 0;
    const avgDisk = servers.reduce((sum, s) => sum + s.disk, 0) / servers.length || 0;

    return [
      {
        id: 'metric-1',
        label: 'Total Servers',
        value: servers.length,
        unit: '',
        trend: 'neutral',
        status: 'success',
        icon: 'server',
        change: 0,
        previousValue: servers.length,
      },
      {
        id: 'metric-2',
        label: 'Average CPU',
        value: Math.round(avgCpu),
        unit: '%',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        status: avgCpu > 85 ? 'error' : avgCpu > 70 ? 'warning' : 'success',
        icon: 'cpu',
        change: Math.floor((Math.random() - 0.5) * 10),
        previousValue: Math.round(avgCpu) - Math.floor((Math.random() - 0.5) * 10),
      },
      {
        id: 'metric-3',
        label: 'Memory Usage',
        value: Math.round(avgMemory),
        unit: '%',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        status: avgMemory > 85 ? 'error' : avgMemory > 70 ? 'warning' : 'success',
        icon: 'memory',
        change: Math.floor((Math.random() - 0.5) * 5),
        previousValue: Math.round(avgMemory) - Math.floor((Math.random() - 0.5) * 5),
      },
      {
        id: 'metric-4',
        label: 'Active Alerts',
        value: this.alerts().filter((a) => a.active).length,
        unit: '',
        trend: 'neutral',
        status: 'warning',
        icon: 'alert',
        change: 0,
        previousValue: this.alerts().filter((a) => a.active).length,
      },
      {
        id: 'metric-5',
        label: 'Network Traffic',
        value: Math.round(Math.random() * 500),
        unit: 'MB/s',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        status: 'success',
        icon: 'network',
        change: Math.floor((Math.random() - 0.5) * 20),
        previousValue: Math.round(Math.random() * 500),
      },
      {
        id: 'metric-6',
        label: 'System Uptime',
        value: Math.round(servers.reduce((sum, s) => sum + s.uptime, 0) / servers.length),
        unit: 'days',
        trend: 'up',
        status: 'success',
        icon: 'uptime',
        change: 0,
        previousValue: Math.round(servers.reduce((sum, s) => sum + s.uptime, 0) / servers.length),
      },
    ];
  }

  /**
   * Generate mock alerts
   */
  private generateMockAlerts(): Alert[] {
    return [
      {
        id: 'alert-1',
        name: 'High CPU on Production Servers',
        condition: {
          metric: 'cpu',
          operator: '>',
          threshold: 85,
          duration: 5,
          unit: '%',
        },
        severity: 'critical',
        channels: {
          email: { enabled: true, addresses: ['admin@example.com'] },
          slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/...' },
          sms: { enabled: false, numbers: [] },
        },
        active: true,
        triggeredCount: 3,
        lastTriggered: new Date(Date.now() - 3600000),
        createdAt: new Date(Date.now() - 86400000 * 30),
        updatedAt: new Date(),
      },
      {
        id: 'alert-2',
        name: 'Low Memory Warning',
        condition: {
          metric: 'memory',
          operator: '>',
          threshold: 90,
          duration: 10,
          unit: '%',
        },
        severity: 'warning',
        channels: {
          email: { enabled: true, addresses: ['ops@example.com'] },
          slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/...' },
          sms: { enabled: false, numbers: [] },
        },
        active: true,
        triggeredCount: 1,
        createdAt: new Date(Date.now() - 86400000 * 20),
        updatedAt: new Date(),
      },
      {
        id: 'alert-3',
        name: 'Disk Space Critical',
        condition: {
          metric: 'disk',
          operator: '>',
          threshold: 95,
          duration: 2,
          unit: '%',
        },
        severity: 'critical',
        channels: {
          email: { enabled: true, addresses: ['admin@example.com', 'ops@example.com'] },
          slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/...' },
          sms: { enabled: true, numbers: ['+1234567890'] },
        },
        active: true,
        triggeredCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 15),
        updatedAt: new Date(),
      },
      {
        id: 'alert-4',
        name: 'High Network Traffic',
        condition: {
          metric: 'network',
          operator: '>',
          threshold: 500,
          duration: 3,
          unit: 'MB/s',
        },
        severity: 'info',
        channels: {
          email: { enabled: true, addresses: ['monitoring@example.com'] },
          slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/...' },
          sms: { enabled: false, numbers: [] },
        },
        active: false,
        triggeredCount: 5,
        createdAt: new Date(Date.now() - 86400000 * 10),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Generate mock logs
   */
  private generateMockLogs(): LogEntry[] {
    const servers = this.servers();
    const logMessages = {
      info: [
        'Connection established from 192.168.1.45:3306',
        'User authenticated: admin@example.com',
        'Cache hit for key: session_abc123',
        'Request processed successfully',
        'Database query executed in 45ms',
      ],
      warn: [
        'Memory usage above 85% threshold',
        'API response time 1200ms (slow)',
        'Connection pool near limit: 95/100',
        'Deprecated API endpoint used',
        'SSL certificate expires in 30 days',
      ],
      error: [
        'Database connection timeout after 30s',
        'Failed to parse JSON payload',
        'Unhandled exception in PaymentService',
        'Authentication failed: Invalid token',
        'Failed to upload file: Disk full',
      ],
      debug: [
        'Query executed in 45ms: SELECT * FROM users',
        'Cache miss for key: product_5678',
        'Request headers: {...}',
        'Response status: 200',
        'Processing batch job #12345',
      ],
    };

    const levels = ['info', 'warn', 'error', 'debug'] as const;
    const logs: LogEntry[] = [];

    for (let i = 0; i < 100; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const server = servers[Math.floor(Math.random() * servers.length)];
      const messages = logMessages[level];

      logs.push({
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        level,
        server: server.name,
        serverId: server.id,
        message: messages[Math.floor(Math.random() * messages.length)],
        metadata: {
          duration: Math.floor(Math.random() * 1000),
          statusCode: Math.floor(Math.random() * 200) + 200,
        },
      });
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get server by ID
   */
  getServerById(id: string): Server | undefined {
    return this.servers().find((s) => s.id === id);
  }

  /**
   * Add new server
   */
  addServer(serverData: Partial<Server>): void {
    const newServer: Server = {
      id: crypto.randomUUID(),
      name: serverData.name || 'New Server',
      status: 'online',
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: 0,
      os: serverData.os || 'Ubuntu 22.04',
      location: serverData.location || 'us-east-1',
      ip: serverData.ip || '192.168.1.1',
      lastPing: new Date(),
      networkIn: 0,
      networkOut: 0,
    };

    this.servers.update((servers) => [...servers, newServer]);
  }

  /**
   * Update server
   */
  updateServer(id: string, updates: Partial<Server>): void {
    this.servers.update((servers) =>
      servers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }

  /**
   * Delete server
   */
  deleteServer(id: string): void {
    this.servers.update((servers) => servers.filter((s) => s.id !== id));
  }

  /**
   * Add alert
   */
  addAlert(alertData: Partial<Alert>): void {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      name: alertData.name || 'New Alert',
      condition: alertData.condition || {
        metric: 'cpu',
        operator: '>',
        threshold: 80,
        duration: 5,
        unit: '%',
      },
      severity: alertData.severity || 'warning',
      channels: alertData.channels || {
        email: { enabled: false, addresses: [] },
        slack: { enabled: false, webhookUrl: '' },
        sms: { enabled: false, numbers: [] },
      },
      active: true,
      triggeredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.alerts.update((alerts) => [...alerts, newAlert]);
  }

  /**
   * Update alert
   */
  updateAlert(id: string, updates: Partial<Alert>): void {
    this.alerts.update((alerts) =>
      alerts.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a))
    );
  }

  /**
   * Delete alert
   */
  deleteAlert(id: string): void {
    this.alerts.update((alerts) => alerts.filter((a) => a.id !== id));
  }

  /**
   * Generate chart data for CPU usage
   */
  getCpuChartData(): ChartData {
    const labels = this.generateTimeLabels();
    const data = this.generateRandomData(labels.length, 30, 90);

    return {
      labels,
      datasets: [
        {
          label: 'CPU Usage %',
          data,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }

  /**
   * Generate chart data for memory usage
   */
  getMemoryChartData(): ChartData {
    const labels = this.generateTimeLabels();
    const usedData = this.generateRandomData(labels.length, 10, 50);
    const availableData = usedData.map((val) => 100 - val);

    return {
      labels,
      datasets: [
        {
          label: 'Used (GB)',
          data: usedData,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
        },
        {
          label: 'Available (GB)',
          data: availableData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
      ],
    };
  }

  /**
   * Generate chart data for network traffic
   */
  getNetworkChartData(): ChartData {
    const labels = this.generateTimeLabels();
    const uploadData = this.generateRandomData(labels.length, 50, 300);
    const downloadData = this.generateRandomData(labels.length, 100, 500);

    return {
      labels,
      datasets: [
        {
          label: 'Upload (MB/s)',
          data: uploadData,
          borderColor: '#0ea5e9',
        },
        {
          label: 'Download (MB/s)',
          data: downloadData,
          borderColor: '#10b981',
        },
      ],
    };
  }

  /**
   * Generate time labels
   */
  private generateTimeLabels(): string[] {
    const labels: string[] = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }

    return labels;
  }

  /**
   * Generate random data points
   */
  private generateRandomData(
    count: number,
    min: number = 0,
    max: number = 100
  ): number[] {
    return Array.from({ length: count }, () =>
      Math.floor(Math.random() * (max - min + 1) + min)
    );
  }
}
