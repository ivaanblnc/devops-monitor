import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MonitoringService } from '../../services/monitoring.service';
import { Server } from '../../models/server.model';
import { NotificationService } from '../../services/notification.service';

/**
 * ServersListComponent
 * Table view of all servers with search, filters, and pagination
 */
@Component({
  selector: 'app-servers-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './servers-list.component.html',
  styleUrl: './servers-list.component.scss',
})
export class ServersListComponent implements OnInit {
  monitoringService = inject(MonitoringService);
  notificationService = inject(NotificationService);

  // State
  searchTerm = '';
  selectedStatus = '';
  sortBy = 'name';
  currentPage = signal(1);
  pageSize = 10;
  showModal = signal(false);
  editingServer = signal<Server | null>(null);

  formData = {
    name: '',
    ip: '',
    os: '',
    location: '',
  };

  // Debounce timer
  private searchTimeout: any;

  // Computed values
  filteredServers = computed(() => {
    let servers = this.monitoringService.servers();

    // Filter by search term
    if (this.searchTerm) {
      servers = servers.filter((s) =>
        s.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      servers = servers.filter((s) => s.status === this.selectedStatus);
    }

    // Sort
    servers.sort((a, b) => {
      switch (this.sortBy) {
        case 'cpu':
          return b.cpu - a.cpu;
        case 'memory':
          return b.memory - a.memory;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return servers;
  });

  totalItems = computed(() => this.filteredServers().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize));

  paginatedServers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredServers().slice(start, end);
  });

  ngOnInit(): void {
    // Initial data is loaded by MonitoringService
  }

  /**
   * Handle search input with debounce
   */
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
    }, 300);
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.currentPage.set(1);
  }

  /**
   * Handle sort change
   */
  onSortChange(): void {
    this.currentPage.set(1);
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
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /**
   * Open add server modal
   */
  openAddModal(): void {
    this.editingServer.set(null);
    this.formData = {
      name: '',
      ip: '',
      os: '',
      location: '',
    };
    this.showModal.set(true);
  }

  /**
   * Edit server
   */
  editServer(server: Server): void {
    this.editingServer.set(server);
    this.formData = {
      name: server.name,
      ip: server.ip,
      os: server.os,
      location: server.location,
    };
    this.showModal.set(true);
  }

  /**
   * Delete server
   */
  deleteServer(serverId: string): void {
    if (confirm('Are you sure you want to delete this server?')) {
      this.monitoringService.deleteServer(serverId);
      this.notificationService.success('Server deleted successfully');
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal.set(false);
  }

  /**
   * Submit form
   */
  submitForm(): void {
    if (this.editingServer()) {
      // Update existing server
      this.monitoringService.updateServer(this.editingServer()!.id, {
        name: this.formData.name,
        ip: this.formData.ip,
        os: this.formData.os,
        location: this.formData.location,
      });
      this.notificationService.success('Server updated successfully');
    } else {
      // Add new server
      this.monitoringService.addServer({
        name: this.formData.name,
        ip: this.formData.ip,
        os: this.formData.os,
        location: this.formData.location,
      });
      this.notificationService.success('Server added successfully');
    }
    this.closeModal();
  }
}
