import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { ROLES } from '../constants/roles';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private tokenService: TokenService) {}

  getRoles(): string[] {
    return this.tokenService.getRoles();
  }

  getPermissions(): string[] {
    return this.tokenService.getPermissions();
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions?: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions?: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    return permissions.every(permission => this.hasPermission(permission));
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles?: string[]): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }

    return roles.some(role => this.hasRole(role));
  }

  canDisplay(permissions?: string[], roles?: string[]): boolean {
    const permissionAllowed = this.hasAnyPermission(permissions);
    const roleAllowed = this.hasAnyRole(roles);

    return permissionAllowed && roleAllowed;
  }

  isAdmin(): boolean {
    return this.hasRole(ROLES.ADMIN);
  }

  isLibrarian(): boolean {
    return this.hasRole(ROLES.LIBRARIAN);
  }

  isMember(): boolean {
    return this.hasRole(ROLES.MEMBER);
  }

  getPrimaryRole(): string {
    if (this.isAdmin()) {
      return ROLES.ADMIN;
    }

    if (this.isLibrarian()) {
      return ROLES.LIBRARIAN;
    }

    if (this.isMember()) {
      return ROLES.MEMBER;
    }

    return 'USER';
  }
}