import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-wrapper" [class]="wrapperClass">
      @switch (type) {
        @case ('text') {
          <div class="skeleton-container">
            @for (line of linesArray; track $index) {
              <div
                class="skeleton-line"
                [style.width]="
                  $index === linesArray.length - 1 && linesArray.length > 1 ? '60%' : '100%'
                "
                [style.height]="height"
              ></div>
            }
          </div>
        }
        @case ('card') {
          <div class="skeleton-card">
            <div class="skeleton-image" [style.height]="imageHeight"></div>
            <div class="skeleton-content">
              <div class="skeleton-line" style="width: 80%; height: 20px;"></div>
              <div class="skeleton-line" style="width: 100%; height: 14px;"></div>
              <div class="skeleton-line" style="width: 60%; height: 14px;"></div>
            </div>
          </div>
        }
        @case ('avatar') {
          <div class="skeleton-avatar" [style.width]="width" [style.height]="width"></div>
        }
        @case ('image') {
          <div class="skeleton-image-block" [style.width]="width" [style.height]="height"></div>
        }
        @case ('button') {
          <div class="skeleton-button" [style.width]="width" [style.height]="height"></div>
        }
        @case ('table-row') {
          <div class="skeleton-table-row">
            @for (col of columnsArray; track $index) {
              <div class="skeleton-cell" [style.flex]="col.flex || 1">
                <div class="skeleton-line" [style.height]="height"></div>
              </div>
            }
          </div>
        }
        @case ('profile') {
          <div class="skeleton-profile">
            <div class="skeleton-avatar" style="width: 80px; height: 80px;"></div>
            <div class="skeleton-profile-info">
              <div class="skeleton-line" style="width: 150px; height: 20px;"></div>
              <div class="skeleton-line" style="width: 200px; height: 14px;"></div>
            </div>
          </div>
        }
        @case ('list') {
          <div class="skeleton-list">
            @for (item of linesArray; track $index) {
              <div class="skeleton-list-item">
                <div class="skeleton-avatar" style="width: 40px; height: 40px;"></div>
                <div class="skeleton-list-content">
                  <div class="skeleton-line" style="width: 70%; height: 16px;"></div>
                  <div class="skeleton-line" style="width: 50%; height: 12px;"></div>
                </div>
              </div>
            }
          </div>
        }
        @default {
          <div
            class="skeleton-block"
            [style.width]="width"
            [style.height]="height"
            [style.border-radius]="radius"
          ></div>
        }
      }
    </div>
  `,
  styles: [
    `
      .skeleton-wrapper
        width: 100%

      .skeleton-container
        display: flex
        flex-direction: column
        gap: 8px

      .skeleton-line,
      .skeleton-block,
      .skeleton-image,
      .skeleton-image-block,
      .skeleton-avatar,
      .skeleton-button,
      .skeleton-cell > div
        background: linear-gradient(90deg, var(--bg-tertiary, #1f1f1f) 25%, var(--bg-hover, #2a2a2a) 50%, var(--bg-tertiary, #1f1f1f) 75%)
        background-size: 200% 100%
        animation: shimmer 1.5s infinite ease-in-out
        border-radius: 4px

      .skeleton-line
        height: 16px

      .skeleton-card
        background: var(--bg-secondary, #1a1a1a)
        border: 1px solid var(--border-primary, #3a3a3a)
        border-radius: 8px
        overflow: hidden

      .skeleton-image
        width: 100%
        height: 150px
        border-radius: 0

      .skeleton-content
        padding: 16px
        display: flex
        flex-direction: column
        gap: 8px

      .skeleton-avatar
        border-radius: 50%

      .skeleton-image-block
        border-radius: 8px

      .skeleton-button
        height: 40px
        border-radius: 4px

      .skeleton-table-row
        display: flex
        gap: 16px
        padding: 12px 0
        border-bottom: 1px solid var(--border-primary, #3a3a3a)

      .skeleton-cell
        flex: 1

      .skeleton-profile
        display: flex
        align-items: center
        gap: 16px

      .skeleton-profile-info
        display: flex
        flex-direction: column
        gap: 8px

      .skeleton-list
        display: flex
        flex-direction: column
        gap: 12px

      .skeleton-list-item
        display: flex
        align-items: center
        gap: 12px
        padding: 8px 0

      .skeleton-list-content
        flex: 1
        display: flex
        flex-direction: column
        gap: 6px

      @keyframes shimmer
        0%
          background-position: -200% 0
        100%
          background-position: 200% 0

      @media (prefers-reduced-motion: reduce)
        .skeleton-line,
        .skeleton-block,
        .skeleton-image,
        .skeleton-image-block,
        .skeleton-avatar,
        .skeleton-button,
        .skeleton-cell > div
          animation: none
    `,
  ],
})
export class SkeletonComponent {
  @Input() type:
    | 'text'
    | 'card'
    | 'avatar'
    | 'image'
    | 'button'
    | 'table-row'
    | 'profile'
    | 'list'
    | 'custom' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '16px';
  @Input() imageHeight: string = '150px';
  @Input() radius: string = '4px';
  @Input() lines: number = 1;
  @Input() columns: { flex?: number }[] = [{ flex: 1 }, { flex: 2 }, { flex: 1 }];
  @Input() wrapperClass: string = '';

  get linesArray(): number[] {
    return Array(this.lines).fill(0);
  }

  get columnsArray(): { flex?: number }[] {
    return this.columns;
  }
}
