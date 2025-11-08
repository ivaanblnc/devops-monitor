import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData } from '../../../models/chart-data.model';

/**
 * ChartComponent
 * Wrapper for Chart.js visualizations using simple canvas-based rendering
 * Note: This is a simplified implementation. In production, use ng2-charts
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  data = input<ChartData>({ labels: [], datasets: [] });
  type = input<'line' | 'bar' | 'area'>('line');
  height = input<number>(300);
  width = input<number>(600);

  /**
   * Handle window resize
   */
  onResize(): void {
    // Re-render chart on resize if needed
  }

  /**
   * Simple line chart rendering using canvas
   */
  renderChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chartData = this.data();
    const type = this.type();

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gridlines
    this.drawGridlines(ctx, canvas);

    // Draw datasets
    chartData.datasets.forEach((dataset, index) => {
      ctx.strokeStyle = dataset.borderColor || '#0ea5e9';
      ctx.lineWidth = dataset.borderWidth || 2;
      ctx.fillStyle = dataset.backgroundColor || 'rgba(14, 165, 233, 0.1)';

      switch (type) {
        case 'line':
          this.drawLineChart(ctx, dataset.data, canvas);
          break;
        case 'area':
          this.drawAreaChart(ctx, dataset.data, canvas);
          break;
        case 'bar':
          this.drawBarChart(ctx, dataset.data, canvas, index, chartData.datasets.length);
          break;
      }
    });

    // Draw labels
    this.drawLabels(ctx, chartData.labels, canvas);
  }

  private drawGridlines(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Horizontal gridlines
    for (let i = 0; i < 5; i++) {
      const y = (canvas.height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }
  }

  private drawLineChart(
    ctx: CanvasRenderingContext2D,
    data: number[],
    canvas: HTMLCanvasElement
  ): void {
    const padding = { left: 50, right: 20, top: 20, bottom: 40 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding.left + (width / (data.length - 1)) * index;
      const y = padding.top + height - ((value - min) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  private drawAreaChart(
    ctx: CanvasRenderingContext2D,
    data: number[],
    canvas: HTMLCanvasElement
  ): void {
    const padding = { left: 50, right: 20, top: 20, bottom: 40 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom);

    data.forEach((value, index) => {
      const x = padding.left + (width / (data.length - 1)) * index;
      const y = padding.top + height - ((value - min) / range) * height;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawBarChart(
    ctx: CanvasRenderingContext2D,
    data: number[],
    canvas: HTMLCanvasElement,
    datasetIndex: number,
    totalDatasets: number
  ): void {
    const padding = { left: 50, right: 20, top: 20, bottom: 40 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;

    const max = Math.max(...data);
    const barWidth = width / (data.length * totalDatasets);
    const offset = barWidth * datasetIndex;

    data.forEach((value, index) => {
      const x = padding.left + (width / data.length) * index + offset;
      const barHeight = (value / max) * height;
      const y = canvas.height - padding.bottom - barHeight;

      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });
  }

  private drawLabels(
    ctx: CanvasRenderingContext2D,
    labels: string[],
    canvas: HTMLCanvasElement
  ): void {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const padding = 50;
    const width = canvas.width - padding * 2;

    labels.forEach((label, index) => {
      const x = padding + (width / (labels.length - 1)) * index;
      const y = canvas.height - 10;
      ctx.fillText(label, x, y);
    });
  }
}
