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
import { MonitoringService } from '../../services/monitoring.service';
import { NotificationService } from '../../services/notification.service';
import { Alert } from '../../models/alert.model';

/**
 * AlertsComponent
 * Manage alert rules with create/edit modal
 */
@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent implements OnInit {
  private monitoringService = inject(MonitoringService);
  private notificationService = inject(NotificationService);

  showModal = signal(false);
  editingAlert = signal<Alert | null>(null);

  allAlerts = computed(() => this.monitoringService.alerts());
  activeAlerts = computed(() => this.allAlerts().filter((a) => a.active));
  criticalAlerts = computed(() => this.allAlerts().filter((a) => a.severity === 'critical'));

  formData = {
    name: '',
    metric: '' as 'cpu' | 'memory' | 'disk' | 'network' | 'responseTime' | 'errorRate' | '',
    operator: '>' as '>' | '<' | '=' | '!=' | '>=' | '<=' | '',
    threshold: 80,
    duration: 5,
    severity: 'critical' as 'critical' | 'warning' | 'info',
    emailEnabled: false,
    emailAddresses: '',
    slackEnabled: false,
    slackWebhook: '',
    smsEnabled: false,
    smsNumbers: '',
  };

  ngOnInit(): void {
    // Initialize alert data if needed
  }

  /**
   * Get human-readable condition text
   */
  getConditionText(alert: Alert): string {
    const { metric, operator, threshold, unit } = alert.condition;
    return `${metric} ${operator} ${threshold}${unit}`;
  }

  /**
   * Toggle alert active status
   */
  toggleAlert(id: string, event: any): void {
    const alert = this.allAlerts().find((a) => a.id === id);
    if (alert) {
      const updated = { ...alert, active: event.target.checked };
      this.monitoringService.updateAlert(id, updated);
    }
  }

  /**
   * Open add alert modal
   */
  openAddModal(): void {
    this.editingAlert.set(null);
    this.formData = {
      name: '',
      metric: '' as any,
      operator: '>' as any,
      threshold: 80,
      duration: 5,
      severity: 'critical',
      emailEnabled: false,
      emailAddresses: '',
      slackEnabled: false,
      slackWebhook: '',
      smsEnabled: false,
      smsNumbers: '',
    };
    this.showModal.set(true);
  }

  /**
   * Edit alert
   */
  editAlert(alert: Alert): void {
    this.editingAlert.set(alert);
    this.formData = {
      name: alert.name,
      metric: alert.condition.metric as any,
      operator: alert.condition.operator as any,
      threshold: alert.condition.threshold,
      duration: alert.condition.duration,
      severity: alert.severity,
      emailEnabled: alert.channels.email.enabled,
      emailAddresses: alert.channels.email.addresses.join(', '),
      slackEnabled: alert.channels.slack.enabled,
      slackWebhook: alert.channels.slack.webhookUrl,
      smsEnabled: alert.channels.sms.enabled,
      smsNumbers: alert.channels.sms.numbers.join(', '),
    };
    this.showModal.set(true);
  }

  /**
   * Delete alert
   */
  deleteAlert(id: string): void {
    if (confirm('Are you sure you want to delete this alert?')) {
      this.monitoringService.deleteAlert(id);
      this.notificationService.success('Alert deleted');
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal.set(false);
  }

  /**
   * Submit form - create or update alert
   */
  submitForm(): void {
    if (!this.formData.name || !this.formData.metric) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    const alert: Alert = {
      id: this.editingAlert()?.id || crypto.randomUUID(),
      name: this.formData.name,
      condition: {
        metric: this.formData.metric as any,
        operator: this.formData.operator as any,
        threshold: this.formData.threshold,
        duration: this.formData.duration,
        unit: '%',
      },
      severity: this.formData.severity,
      channels: {
        email: {
          enabled: this.formData.emailEnabled,
          addresses: this.formData.emailEnabled
            ? this.formData.emailAddresses.split(',').map((e) => e.trim()).filter((e) => e)
            : [],
        },
        slack: {
          enabled: this.formData.slackEnabled,
          webhookUrl: this.formData.slackEnabled ? this.formData.slackWebhook : '',
        },
        sms: {
          enabled: this.formData.smsEnabled,
          numbers: this.formData.smsEnabled
            ? this.formData.smsNumbers.split(',').map((n) => n.trim()).filter((n) => n)
            : [],
        },
      },
      active: this.editingAlert()?.active ?? true,
      triggeredCount: this.editingAlert()?.triggeredCount ?? 0,
      lastTriggered: this.editingAlert()?.lastTriggered || new Date(),
      createdAt: this.editingAlert()?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    if (this.editingAlert()) {
      this.monitoringService.updateAlert(alert.id, alert);
      this.notificationService.success('Alert updated successfully');
    } else {
      this.monitoringService.addAlert(alert);
      this.notificationService.success('Alert created successfully');
    }

    this.closeModal();
  }
}
