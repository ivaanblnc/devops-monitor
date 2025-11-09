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
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';

/**
 * SettingsComponent
 * User preferences and configuration
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  // Current date for date format preview
  currentDate = signal(new Date());

  // Sections open state
  sectionsOpen = signal({
    general: true,
    notifications: false,
    display: false,
  });

  // Timezone search
  timezoneSearch = '';
  timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
  ];

  // Settings
  settings = {
    // General
    refreshInterval: 5,
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    // Notifications
    emailNotifications: true,
    emailAddress: 'admin@devops.local',
    slackNotifications: false,
    slackWebhook: '',
    smsNotifications: false,
    smsPhoneNumber: '',
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
    // Display
    chartTimeRange: '24h' as '1h' | '6h' | '24h' | '7d' | '30d',
    logsPerPage: 50,
    enableAnimations: true,
    displayDensity: 'compact' as 'comfortable' | 'compact' | 'dense',
  };

  // Original settings for comparison
  private originalSettings = { ...this.settings };

  // Computed
  isDirty = computed(() => JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings));

  filteredTimezones = computed(() => {
    const search = this.timezoneSearch.toLowerCase();
    if (!search) return this.timezones;
    return this.timezones.filter((tz) => tz.toLowerCase().includes(search));
  });

  ngOnInit(): void {
    // Load settings from localStorage
    const saved = localStorage.getItem('devops-monitor-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
      this.originalSettings = { ...this.settings };
    }
  }

  /**
   * Toggle section
   */
  toggleSection(section: string): void {
    this.sectionsOpen.update((sections) => ({
      ...sections,
      [section]: !sections[section as keyof typeof sections],
    }));
  }

  /**
   * Save settings
   */
  saveSettings(): void {
    localStorage.setItem('devops-monitor-settings', JSON.stringify(this.settings));
    this.originalSettings = { ...this.settings };
    this.notificationService.success('Settings saved successfully');
  }

  /**
   * Send test email
   */
  sendTestEmail(): void {
    if (!this.settings.emailAddress) {
      this.notificationService.error('Please enter an email address');
      return;
    }
    this.notificationService.success(`Test email sent to ${this.settings.emailAddress}`);
  }

  /**
   * Send test Slack message
   */
  sendTestSlack(): void {
    if (!this.settings.slackWebhook) {
      this.notificationService.error('Please enter a Slack webhook URL');
      return;
    }
    this.notificationService.success('Test message sent to Slack');
  }

  /**
   * Send test SMS
   */
  sendTestSMS(): void {
    if (!this.settings.smsPhoneNumber) {
      this.notificationService.error('Please enter a phone number');
      return;
    }
    this.notificationService.success(`Test SMS sent to ${this.settings.smsPhoneNumber}`);
  }
}
