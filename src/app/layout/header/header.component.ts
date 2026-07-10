import { Component, Inject } from '@angular/core';

import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

constructor(public authService: AuthService,
   private permissionService :PermissionService
) {}

  logout(): void {
    this.authService.logout();
  }

  get primaryRole(): string {
    return this.permissionService.getPrimaryRole();
  }
}