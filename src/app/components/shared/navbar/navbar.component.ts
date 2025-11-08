import { Component, signal, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../services/notification.service';
import { ThemeService } from '../../../services/theme.service';

/**
 * NavbarComponent
 * Top navigation bar for mobile devices
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  notificationService = inject(NotificationService);
  themeService = inject(ThemeService);

  showNotifications = signal(false);
  recentToasts = signal<Toast[]>([]);
  notificationCount = signal(0);

  ngOnInit(): void {
    // Subscribe to toasts
    // Note: This is simplified. In production, use proper signal reactivity
    setInterval(() => {
      const toasts = this.notificationService.toasts();
      this.recentToasts.set(toasts);
      this.notificationCount.set(toasts.length);
    }, 1000);
  }

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('is-open');
  }

  /**
   * Toggle notifications dropdown
   */
  toggleNotifications(): void {
    this.showNotifications.update((val) => !val);
  }

  /**
   * Clear notifications
   */
  clearNotifications(): void {
    this.notificationService.removeAll();
    this.recentToasts.set([]);
    this.notificationCount.set(0);
  }

  /**
   * Get icon for notification type
   */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📬';
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
