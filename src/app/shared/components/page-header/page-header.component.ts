import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {

  readonly title = input('');
  readonly description = input('');

  readonly backRoute = input<string | undefined>(undefined);

  readonly actionLabel = input<string | undefined>(undefined);
  readonly actionRoute = input<string | undefined>(undefined);
  readonly actionIcon = input('bi bi-plus-circle');
  readonly showAction = input(false);
}
