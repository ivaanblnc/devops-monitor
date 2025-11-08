import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringService } from '../../services/monitoring.service';
import { NotificationService } from '../../services/notification.service';
import { LogEntry } from '../../models/log-entry.model';

/**
 * LogsComponent
 * View and filter logs with advanced search and export
 */
@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit, OnDestroy {
  private monitoringService = inject(MonitoringService);
  private notificationService = inject(NotificationService);

  // State
  filtersOpen = signal(false);
  selectedLevels = signal<string[]>(['debug', 'info', 'warn', 'error']);
  selectedServer = '';
  searchTerm = '';
  autoScroll = true;
  currentPage = signal(1);
  expandedLogs = signal<number[]>([]);
  newLogsCount = signal(0);

  // Constants
  logLevels = ['debug', 'info', 'warn', 'error'];
  logsPerPage = 50;

  // Date filters
  dateFrom = '';
  dateTo = '';

  // Computed
  allLogs = computed(() => this.monitoringService.logs());
  servers = computed(() => this.monitoringService.servers());

  filteredLogs = computed(() => {
    let logs = this.allLogs();

    // Level filter
    logs = logs.filter((l) => this.selectedLevels().includes(l.level));

    // Server filter
    if (this.selectedServer) {
      logs = logs.filter((l) => l.server === this.selectedServer);
    }

    // Date range filter
    if (this.dateFrom || this.dateTo) {
      logs = logs.filter((l) => {
        const logDate = new Date(l.timestamp).toISOString().split('T')[0];
        if (this.dateFrom && logDate < this.dateFrom) return false;
        if (this.dateTo && logDate > this.dateTo) return false;
        return true;
      });
    }

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.message.toLowerCase().includes(search) ||
          l.server.toLowerCase().includes(search) ||
          (l.stackTrace?.toLowerCase().includes(search) ?? false)
      );
    }

    return logs.reverse(); // Most recent first
  });

  totalPages = computed(() => Math.ceil(this.filteredLogs().length / this.logsPerPage));

  paginatedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.logsPerPage;
    const end = start + this.logsPerPage;
    return this.filteredLogs().slice(start, end);
  });

  ngOnInit(): void {
    // Set default date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    this.dateTo = today.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  /**
   * Get icon for log level
   */
  getLevelIcon(level: string): string {
    switch (level) {
      case 'debug':
        return '🐛';
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  /**
   * Toggle log level filter
   */
  toggleLevel(level: string): void {
    const levels = this.selectedLevels();
    const index = levels.indexOf(level);
    if (index > -1) {
      levels.splice(index, 1);
    } else {
      levels.push(level);
    }
    this.selectedLevels.set([...levels]);
  }

  /**
   * Toggle filters panel on mobile
   */
  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.closeFiltersOnMobile();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedLevels.set(['debug', 'info', 'warn', 'error']);
    this.selectedServer = '';
    this.searchTerm = '';
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    this.dateTo = today.toISOString().split('T')[0];
    this.currentPage.set(1);
    this.closeFiltersOnMobile();
  }

  /**
   * Handle search input with debounce
   */
  onSearchChange(): void {
    this.currentPage.set(1);
  }

  /**
   * Toggle log expansion
   */
  toggleExpand(index: number): void {
    const expanded = this.expandedLogs();
    const idx = expanded.indexOf(index);
    if (idx > -1) {
      expanded.splice(idx, 1);
    } else {
      expanded.push(index);
    }
    this.expandedLogs.set([...expanded]);
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  /**
   * Scroll to top and show new logs
   */
  scrollToTop(): void {
    this.currentPage.set(1);
    this.newLogsCount.set(0);
  }

  /**
   * Export logs to CSV
   */
  exportCSV(): void {
    const logs = this.filteredLogs();
    if (logs.length === 0) {
      this.notificationService.warning('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Level', 'Server', 'Message', 'StackTrace'];
    const rows = logs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.level,
      log.server,
      `"${log.message.replace(/"/g, '""')}"`,
      log.stackTrace ? `"${log.stackTrace.replace(/"/g, '""')}"` : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.notificationService.success(`Exported ${logs.length} logs`);
  }

  /**
   * Close filters on mobile when selecting
   */
  private closeFiltersOnMobile(): void {
    if (window.innerWidth < 768) {
      this.filtersOpen.set(false);
    }
  }
}
