import { Injectable, signal } from '@angular/core';

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * NotificationService
 * Manages toast notifications
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Signal for all active toasts
  toasts = signal<Toast[]>([]);

  /**
   * Show a notification
   */
  show(
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 5000,
    action?: Toast['action']
  ): string {
    const id = crypto.randomUUID();

    const toast: Toast = {
      id,
      message,
      type,
      duration,
      action,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  /**
   * Show success notification
   */
  success(message: string, duration?: number, action?: Toast['action']): string {
    return this.show(message, 'success', duration, action);
  }

  /**
   * Show error notification
   */
  error(message: string, duration?: number, action?: Toast['action']): string {
    return this.show(message, 'error', duration, action);
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration?: number, action?: Toast['action']): string {
    return this.show(message, 'warning', duration, action);
  }

  /**
   * Show info notification
   */
  info(message: string, duration?: number, action?: Toast['action']): string {
    return this.show(message, 'info', duration, action);
  }

  /**
   * Remove notification by ID
   */
  remove(id: string): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Remove all notifications
   */
  removeAll(): void {
    this.toasts.set([]);
  }

  /**
   * Get all current toasts
   */
  getAll(): Toast[] {
    return this.toasts();
  }

  /**
   * Update toast message
   */
  update(id: string, message: string): void {
    this.toasts.update((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, message } : t))
    );
  }
}
