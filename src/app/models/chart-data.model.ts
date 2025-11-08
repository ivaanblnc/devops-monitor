/**
 * Chart Data Model
 * Data structure for Chart.js integration with ng2-charts
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number; // for line charts: 0.1 to 0.4
  pointRadius?: number;
  pointHoverRadius?: number;
  borderWidth?: number;
  type?: 'line' | 'bar' | 'area';
  yAxisID?: 'y' | 'y1';
}

/**
 * Chart type options
 */
export type ChartType = 'line' | 'bar' | 'area' | 'doughnut' | 'pie';

/**
 * Chart options configuration
 */
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
    tooltip?: {
      enabled?: boolean;
      backgroundColor?: string;
      titleColor?: string;
      bodyColor?: string;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
      max?: number;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    x?: {
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}

/**
 * Time range for chart data
 */
export type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D';

/**
 * Chart animation configuration
 */
export interface ChartAnimation {
  duration: number;
  easing: string;
}

/**
 * CPU usage chart data
 */
export interface CpuChartData extends ChartData {
  datasets: [{
    label: 'CPU Usage %';
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }];
}

/**
 * Memory usage chart data
 */
export interface MemoryChartData extends ChartData {
  datasets: [{
    label: 'Used (GB)';
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }, {
    label: 'Available (GB)';
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }];
}

/**
 * Network traffic chart data
 */
export interface NetworkChartData extends ChartData {
  datasets: [{
    label: 'Upload (MB/s)';
    data: number[];
    borderColor: string;
  }, {
    label: 'Download (MB/s)';
    data: number[];
    borderColor: string;
  }];
}
