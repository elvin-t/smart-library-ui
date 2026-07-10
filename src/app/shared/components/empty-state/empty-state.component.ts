import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {

  @Input() icon = 'bi bi-inbox';
  @Input() title = 'No records found';
  @Input() description = 'There is no data available.';
}