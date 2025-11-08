/**
 * Alert Model
 * Represents an alert/monitoring rule
 */
export interface Alert {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: 'critical' | 'warning' | 'info';
  channels: NotificationChannels;
  active: boolean;
  lastTriggered?: Date;
  triggeredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Alert condition definition
 */
export interface AlertCondition {
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'responseTime' | 'errorRate';
  operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
  threshold: number;
  duration: number; // minutes - how long before triggering
  unit: string; // e.g., "%", "ms"
}

/**
 * Notification channels configuration
 */
export interface NotificationChannels {
  email: {
    enabled: boolean;
    addresses: string[];
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
  };
  sms: {
    enabled: boolean;
    numbers: string[];
  };
}

/**
 * Alert creation/update payload
 */
export interface CreateAlertPayload {
  name: string;
  condition: AlertCondition;
  severity: 'critical' | 'warning' | 'info';
  channels: NotificationChannels;
}

/**
 * Alert trigger event
 */
export interface AlertEvent {
  id: string;
  alertId: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  serverId?: string;
  serverName?: string;
  metricValue: number;
}
