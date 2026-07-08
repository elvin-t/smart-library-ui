import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  if (permissionService.hasAnyPermission(requiredPermissions)) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
