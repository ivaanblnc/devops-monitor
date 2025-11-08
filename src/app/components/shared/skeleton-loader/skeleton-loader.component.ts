import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForOf } from '@angular/common';

/**
 * SkeletonLoaderComponent
 * Displays animated skeleton loaders while content is loading
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule, NgForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
})
export class SkeletonLoaderComponent {
  type = input<'card' | 'table' | 'chart' | 'text'>('text');
  rows = input<number>(3);

  /**
   * Get array of rows for ngFor
   */
  getRowArray(): number[] {
    return Array.from({ length: this.rows() }, (_, i) => i);
  }
}
