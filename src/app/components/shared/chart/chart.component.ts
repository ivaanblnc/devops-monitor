import {
  Component,
  input,
  ChangeDetectionStrategy,
  signal,
  effect,
  viewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart as ChartJS, registerables } from 'chart.js';
import { ChartData } from '../../../models/chart-data.model';

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
            color: 'var(--color-text-secondary)',
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
          backgroundColor: 'var(--color-bg-overlay)',
          titleColor: 'var(--color-text-primary)',
          bodyColor: 'var(--color-text-secondary)',
          borderColor: 'var(--color-border)',
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
            color: 'var(--color-border-subtle)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: {
            color: 'var(--color-text-tertiary)',
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
            color: 'var(--color-text-tertiary)',
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
