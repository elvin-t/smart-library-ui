import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {

  @Input() title = '';
  @Input() description = '';
  @Input() backRoute?: string;
  @Input() actionLabel?: string;
  @Input() actionRoute?: string;
  @Input() actionIcon = 'bi bi-plus-circle';
  @Input() showAction = false;
}