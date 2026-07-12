import { Injectable, computed, inject, signal } from '@angular/core';

import { TokenService } from './token.service';
import { ROLES } from '../constants/roles';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly tokenService = inject(TokenService);

  private readonly rolesSignal = signal<string[]>([]);
  private readonly permissionsSignal = signal<string[]>([]);

  readonly roles = this.rolesSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();

  readonly primaryRole = computed(() => {
    if (this.rolesSignal().includes(ROLES.ADMIN)) {
      return ROLES.ADMIN;
    }

    if (this.rolesSignal().includes(ROLES.LIBRARIAN)) {
      return ROLES.LIBRARIAN;
    }

    if (this.rolesSignal().includes(ROLES.MEMBER)) {
      return ROLES.MEMBER;
    }

    return 'USER';
  });

  readonly isAdminSignal = computed(() =>
    this.rolesSignal().includes(ROLES.ADMIN)
  );

  readonly isLibrarianSignal = computed(() =>
    this.rolesSignal().includes(ROLES.LIBRARIAN)
  );

  readonly isMemberSignal = computed(() =>
    this.rolesSignal().includes(ROLES.MEMBER)
  );

  constructor() {
    this.loadFromToken();
  }

  loadFromToken(): void {
    this.rolesSignal.set(this.tokenService.getRoles());
    this.permissionsSignal.set(this.tokenService.getPermissions());
  }

  clear(): void {
    this.rolesSignal.set([]);
    this.permissionsSignal.set([]);
  }

  getRoles(): string[] {
    return this.rolesSignal();
  }

  getPermissions(): string[] {
    return this.permissionsSignal();
  }

  hasPermission(permission: string): boolean {
    return this.permissionsSignal().includes(permission);
  }

  hasAnyPermission(permissions?: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    return permissions.some(permission =>
      this.hasPermission(permission)
    );
  }

  hasAllPermissions(permissions?: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    return permissions.every(permission =>
      this.hasPermission(permission)
    );
  }

  hasRole(role: string): boolean {
    return this.rolesSignal().includes(role);
  }

  hasAnyRole(roles?: string[]): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }

    return roles.some(role =>
      this.hasRole(role)
    );
  }

  canDisplay(permissions?: string[], roles?: string[]): boolean {
    const permissionAllowed = this.hasAnyPermission(permissions);
    const roleAllowed = this.hasAnyRole(roles);

    return permissionAllowed && roleAllowed;
  }

  isAdmin(): boolean {
    return this.isAdminSignal();
  }

  isLibrarian(): boolean {
    return this.isLibrarianSignal();
  }

  isMember(): boolean {
    return this.isMemberSignal();
  }

  getPrimaryRole(): string {
    return this.primaryRole();
  }
}
