import {
  Component,
  input,
  computed,
  signal,
  effect,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * MetricCardComponent
 * Displays a single metric with value, trend, and status indicator
 */
@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
})
export class MetricCardComponent implements OnInit {
  label = input<string>('Metric');
  value = input<number>(0);
  unit = input<string>('');
  trend = input<'up' | 'down' | 'neutral'>('neutral');
  status = input<'success' | 'warning' | 'error'>('success');
  icon = input<string>('chart');
  change = input<number>(0);

  displayValue = signal<string>('0');
  animatedValue = signal<number>(0);

  Math = Math;

  trendArrow = computed(() => {
    switch (this.trend()) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  });

  ngOnInit(): void {
    this.animateValue();
  }

  /**
   * Animate value count-up effect
   */
  private animateValue(): void {
    const targetValue = this.value();
    const startValue = this.animatedValue();
    const duration = 800; // milliseconds
    const frameDuration = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameDuration);
    const increment = (targetValue - startValue) / totalFrames;

    let currentFrame = 0;

    const animate = () => {
      currentFrame++;
      const currentValue = startValue + increment * currentFrame;

      if (currentFrame < totalFrames) {
        this.animatedValue.set(currentValue);
        this.updateDisplayValue();
        requestAnimationFrame(animate);
      } else {
        this.animatedValue.set(targetValue);
        this.updateDisplayValue();
      }
    };

    animate();
  }

  /**
   * Update display value formatting
   */
  private updateDisplayValue(): void {
    const value = this.animatedValue();
    if (value < 1000) {
      this.displayValue.set(value.toFixed(0));
    } else if (value < 1000000) {
      this.displayValue.set((value / 1000).toFixed(1) + 'K');
    } else {
      this.displayValue.set((value / 1000000).toFixed(1) + 'M');
    }
  }
}
