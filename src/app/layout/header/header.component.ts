import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  private readonly authService = inject(AuthService);
  private readonly permissionService = inject(PermissionService);

  readonly userEmail = computed(() =>
    this.authService.getEmail() || 'User'
  );

  readonly primaryRole = computed(() =>
    this.permissionService.getPrimaryRole()
  );

  logout(): void {
    this.authService.logout();
  }
}
