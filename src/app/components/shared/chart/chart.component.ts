import {
  Component,
  input,
  ChangeDetectionStrategy,
  signal,
  effect,
  viewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart as ChartJS, registerables } from 'chart.js';
import { ChartData } from '../../../models/chart-data.model';
import { ThemeService } from '../../../services/theme.service';

// Register ChartJS components
ChartJS.register(...registerables);

/**
 * ChartComponent
 * Wrapper for Chart.js visualizations using ng2-charts
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements AfterViewInit {
  data = input<ChartData>({ labels: [], datasets: [] });
  type = input<'line' | 'bar'>('line');
  height = input<number>(300);

  themeService = inject(ThemeService);

  chart = viewChild(BaseChartDirective);
  chartData = signal<any>(this.getChartConfig());

  constructor() {
    effect(() => {
      // Update chart whenever input data changes
      this.chartData.set(this.getChartConfig());
      // Trigger chart update
      if (this.chart()) {
        this.chart()?.chart?.update();
      }
    });

    // Update chart when theme changes
    effect(() => {
      this.themeService.isDarkMode(); // Track theme changes
      if (this.chart()) {
        this.chart()?.chart?.update();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.chart()) {
        this.chart()?.chart?.update();
      }
    }, 100);
  }

  /**
   * Get Chart.js configuration
   */
  private getChartConfig(): any {
    const chartData = this.data();
    const type = this.type();

    return {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.borderColor || 'rgba(14, 165, 233, 0.8)',
        backgroundColor: dataset.backgroundColor || 'rgba(14, 165, 233, 0.1)',
        fill: dataset.fill ?? (type === 'line'),
        tension: dataset.tension || 0.4,
        borderWidth: dataset.borderWidth || 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: dataset.borderColor || 'rgba(14, 165, 233, 0.8)',
      })),
    };
  }

  /**
   * Get Chart.js options
   */
  getChartOptions(): any {
    const isDark = this.themeService.isDarkMode();
    const textColor = isDark ? '#ffffff' : '#1a1a1a';
    const gridColor = isDark ? '#404040' : '#e5e5e5';

    return {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          display: this.data().datasets.length > 1,
          position: 'bottom' as const,
          labels: {
            color: textColor,
            font: {
              size: 13,
              weight: '500',
              family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          enabled: true,
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1a1a1a',
          bodyColor: '#1a1a1a',
          borderColor: '#e5e5e5',
          borderWidth: 1,
          titleFont: {
            size: 13,
            weight: 600,
          },
          bodyFont: {
            size: 12,
          },
          padding: 12,
          displayColors: true,
          callbacks: {
            afterLabel: (context: any) => {
              return '';
            },
          },
        },
        filler: {
          propagate: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: {
            color: textColor,
            font: {
              size: 12,
              weight: 500,
            },
            padding: 10,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
            font: {
              size: 12,
              weight: 500,
            },
            padding: 10,
          },
        },
      },
    };
  }
}
