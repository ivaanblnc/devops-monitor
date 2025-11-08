import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/**
 * SidebarComponent
 * Main navigation sidebar with theme toggle and user profile
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  themeService = inject(ThemeService);

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Servers', path: '/servers', icon: '🖥️' },
    { label: 'Alerts', path: '/alerts', icon: '🔔' },
    { label: 'Logs', path: '/logs', icon: '📋' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  /**
   * Toggle theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
