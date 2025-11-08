import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService } from '../../services/monitoring.service';
import { MetricCardComponent } from '../../components/shared/metric-card/metric-card.component';
import { ChartComponent } from '../../components/shared/chart/chart.component';
import { SkeletonLoaderComponent } from '../../components/shared/skeleton-loader/skeleton-loader.component';
import { ChartData } from '../../models/chart-data.model';

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

/**
 * DashboardComponent
 * Main overview page with metrics and real-time charts
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MetricCardComponent,
    ChartComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  monitoringService = inject(MonitoringService);

  // State
  selectedRange = signal<TimeRange>('24h');
  isLoading = signal(false);
  timeRanges: TimeRange[] = ['1h', '6h', '24h', '7d', '30d'];

  // Computed values
  metrics = computed(() => this.monitoringService.metrics());
  stats = computed(() => this.monitoringService.serverStats());

  activeAlertsCount = computed(() => this.monitoringService.activeAlerts().length);
  criticalAlertsCount = computed(
    () =>
      this.monitoringService.activeAlerts().filter((a) => a.severity === 'critical')
        .length
  );

  cpuChartData = computed(() => this.getCpuChart());
  memoryChartData = computed(() => this.getMemoryChart());
  networkChartData = computed(() => this.getNetworkChart());

  ngOnInit(): void {
    this.isLoading.set(false);
  }

  /**
   * Set time range and reload data
   */
  setTimeRange(range: TimeRange): void {
    this.selectedRange.set(range);
    // Chart data will auto-update via computed
  }

  /**
   * Get CPU chart data
   */
  private getCpuChart(): ChartData {
    const hours = this.getHoursForRange();
    return {
      labels: hours,
      datasets: [
        {
          label: 'Average CPU Usage',
          data: hours.map((_, i) =>
            Math.min(95, Math.max(5, 45 + Math.sin(i * 0.5) * 20 + Math.random() * 15))
          ),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        } as any,
      ],
    };
  }

  /**
   * Get memory chart data
   */
  private getMemoryChart(): ChartData {
    const hours = this.getHoursForRange();
    const used = hours.map((_, i) =>
      Math.min(90, Math.max(10, 60 + Math.sin(i * 0.3) * 15 + Math.random() * 10))
    );
    const available = used.map((u) => 100 - u);

    return {
      labels: hours,
      datasets: [
        {
          label: 'Memory Used',
          data: used,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        } as any,
        {
          label: 'Memory Available',
          data: available,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        } as any,
      ],
    };
  }

  /**
   * Get network chart data
   */
  private getNetworkChart(): ChartData {
    const hours = this.getHoursForRange();
    const upload = hours.map((_, i) =>
      Math.max(0, 150 + Math.sin(i * 0.4) * 80 + Math.random() * 50)
    );
    const download = hours.map((_, i) =>
      Math.max(0, 300 + Math.sin(i * 0.6) * 120 + Math.random() * 80)
    );

    return {
      labels: hours,
      datasets: [
        {
          label: 'Upload (Mbps)',
          data: upload,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          fill: false,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        } as any,
        {
          label: 'Download (Mbps)',
          data: download,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          fill: false,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        } as any,
      ],
    };
  }

  /**
   * Get hours/labels based on time range
   */
  private getHoursForRange(): string[] {
    const now = new Date();
    let hours = 24;
    let format = 'HH:mm';

    switch (this.selectedRange()) {
      case '1h':
        hours = 12;
        format = 'mm:ss';
        break;
      case '6h':
        hours = 24;
        break;
      case '24h':
        hours = 24;
        break;
      case '7d':
        hours = 7;
        format = 'ddd';
        break;
      case '30d':
        hours = 30;
        format = 'dd MMM';
        break;
    }

    return Array.from({ length: hours }, (_, i) => {
      const date = new Date(now);
      if (this.selectedRange() === '1h') {
        date.setMinutes(date.getMinutes() - (hours - i - 1));
        return String(i).padStart(2, '0') + ':00';
      } else if (['7d', '30d'].includes(this.selectedRange())) {
        date.setDate(date.getDate() - (hours - i - 1));
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      } else {
        date.setHours(date.getHours() - (hours - i - 1));
        return String(date.getHours()).padStart(2, '0') + ':00';
      }
    });
  }

  /**
   * Get time range label
   */
  getTimeRangeLabel(range: TimeRange): string {
    const labels: Record<TimeRange, string> = {
      '1h': 'Last Hour',
      '6h': 'Last 6 Hours',
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
    };
    return labels[range];
  }
}
