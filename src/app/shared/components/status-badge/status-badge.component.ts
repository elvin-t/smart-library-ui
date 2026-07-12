import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {

  readonly status = input('');

  readonly badgeClass = computed(() => {
    const value = this.status()?.toUpperCase();

    switch (value) {
      case 'ACTIVE':
      case 'AVAILABLE':
      case 'RETURNED':
      case 'SENT':
      case 'PAID':
        return 'text-bg-success';

      case 'BORROWED':
      case 'PENDING':
        return 'text-bg-primary';

      case 'SUSPENDED':
      case 'LOW_STOCK':
        return 'text-bg-warning';

      case 'EXPIRED':
      case 'OVERDUE':
      case 'FAILED':
      case 'UNAVAILABLE':
        return 'text-bg-danger';

      default:
        return 'text-bg-secondary';
    }
  });
}
