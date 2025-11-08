import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ServersListComponent } from './pages/servers-list/servers-list.component';
import { ServerDetailComponent } from './pages/server-detail/server-detail.component';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { LogsComponent } from './pages/logs/logs.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'servers', component: ServersListComponent },
  { path: 'servers/:id', component: ServerDetailComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: 'logs', component: LogsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/dashboard' },
];

