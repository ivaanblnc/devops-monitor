/**
 * Metric Model
 * Represents a monitored metric/KPI
 */
export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string; // e.g., "%", "GB", "MB/s"
  trend: 'up' | 'down' | 'neutral';
  status: 'success' | 'warning' | 'error';
  icon: string; // e.g., "cpu", "memory", "disk"
  change: number; // percentage change
  previousValue: number;
}

/**
 * Metric history point
 */
export interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

/**
 * Metric history/time series data
 */
export interface MetricHistory {
  metricId: string;
  label: string;
  unit: string;
  data: MetricDataPoint[];
}
