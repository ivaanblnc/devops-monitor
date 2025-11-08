import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MonitoringService } from '../../services/monitoring.service';
import { NotificationService } from '../../services/notification.service';
import { Server } from '../../models/server.model';
import { ChartComponent } from '../../components/shared/chart/chart.component';
import { SkeletonLoaderComponent } from '../../components/shared/skeleton-loader/skeleton-loader.component';
import { ChartData } from '../../models/chart-data.model';

/**
 * ServerDetailComponent
 * Detailed view of a single server with charts, metrics, and logs
 */
@Component({
  selector: 'app-server-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartComponent, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './server-detail.component.html',
  styleUrl: './server-detail.component.scss',
})
export class ServerDetailComponent implements OnInit {
  monitoringService = inject(MonitoringService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);

  serverId = signal<string | null>(null);
  server = computed(() => {
    const id = this.serverId();
    if (!id) return null;
    const srv = this.monitoringService.getServerById(id);
    return srv;
  });

  recentLogs = computed(() =>
    this.monitoringService
      .logs()
      .filter((log) => log.server === (this.server()?.name || ''))
      .slice(0, 10)
  );

  cpuChart = computed(() => this.generateCpuChart());
  memoryChart = computed(() => this.generateMemoryChart());
  networkChart = computed(() => this.generateNetworkChart());
  diskChart = computed(() => this.generateDiskChart());

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.serverId.set(params['id']);
    });
  }

  /**
   * Restart server
   */
  restartServer(): void {
    this.notificationService.warning('Restart this server?', 0, {
      label: 'Confirm',
      callback: () => {
        this.notificationService.success('Server restart initiated ✓', 5000);
      },
    });
  }

  /**
   * Edit server
   */
  editServer(): void {
    this.notificationService.info('Edit functionality not yet implemented');
  }

  /**
   * Delete server
   */
  deleteServer(): void {
    this.notificationService.error('Delete this server permanently?', 0, {
      label: 'Delete',
      callback: () => {
        this.monitoringService.deleteServer(this.serverId()!);
        this.notificationService.success('Server deleted successfully ✓', 5000);
      },
    });
  }

  /**
   * Generate CPU chart data
   */
  private generateCpuChart(): ChartData {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return {
      labels,
      datasets: [
        {
          label: 'CPU Usage %',
          data: labels.map((_, i) =>
            Math.min(95, Math.max(5, 45 + Math.sin(i * 0.5) * 20 + Math.random() * 15))
          ),
          borderColor: 'rgba(14, 165, 233, 0.8)',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  /**
   * Generate memory chart data
   */
  private generateMemoryChart(): ChartData {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const used = labels.map((_, i) =>
      Math.min(90, Math.max(10, 60 + Math.sin(i * 0.3) * 15 + Math.random() * 10))
    );
    return {
      labels,
      datasets: [
        {
          label: 'Memory Used %',
          data: used,
          borderColor: 'rgba(239, 68, 68, 0.8)',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  /**
   * Generate network chart data
   */
  private generateNetworkChart(): ChartData {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return {
      labels,
      datasets: [
        {
          label: 'Upload (Mbps)',
          data: labels.map(() => Math.max(0, 150 + Math.random() * 100)),
          borderColor: 'rgba(99, 102, 241, 0.8)',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Download (Mbps)',
          data: labels.map(() => Math.max(0, 300 + Math.random() * 150)),
          borderColor: 'rgba(14, 165, 233, 0.8)',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  }

  /**
   * Generate disk IO chart data
   */
  private generateDiskChart(): ChartData {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return {
      labels,
      datasets: [
        {
          label: 'Read IOPS',
          data: labels.map(() => Math.max(0, 1000 + Math.random() * 500)),
          borderColor: 'rgba(16, 185, 129, 0.8)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
        },
        {
          label: 'Write IOPS',
          data: labels.map(() => Math.max(0, 500 + Math.random() * 300)),
          borderColor: 'rgba(245, 158, 11, 0.8)',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          fill: true,
        },
      ],
    };
  }
}
