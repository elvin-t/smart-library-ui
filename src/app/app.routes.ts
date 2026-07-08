import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/pages/login/login.component';

import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

import { PERMISSIONS } from './core/constants/permissions';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  /**
   * Public Auth Routes
   */
  {
    path: 'login',
    component: LoginComponent
  },

  /**
   * Secured Application Routes
   */
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },


{
  path: 'access-denied',
  loadComponent: () =>
    import('./features/auth/pages/access-denied/access-denied.component')
      .then(m => m.AccessDeniedComponent)
},

      /**
       * Dashboard
       */
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      /**
       * User Management
       * ADMIN / permitted users only
       */
    ]
  },
  /**
   * 404 Fallback
   */
  {
    path: '**',
    redirectTo: 'login'
  }
];
