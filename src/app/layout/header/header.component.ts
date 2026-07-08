import { Component } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}