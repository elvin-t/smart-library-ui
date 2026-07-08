import { Injectable } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private tokenService: TokenService) {}

  hasPermission(permission: string): boolean {
    return this.tokenService.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  hasRole(role: string): boolean {
    return this.tokenService.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}
