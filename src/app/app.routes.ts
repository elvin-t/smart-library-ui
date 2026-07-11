import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login.component';

import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

import { PERMISSIONS } from './core/constants/permissions';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

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

  {
  path: 'register',
  loadComponent: () =>
    import('./features/auth/pages/register/register.component')
      .then(m => m.RegisterComponent)
},

  /**
   * Access Denied Route
   * Keep this outside /app because permission guard redirects to /access-denied
   */
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./features/auth/pages/access-denied/access-denied.component')
        .then(m => m.AccessDeniedComponent)
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
       * Books
       */
      {
        path: 'books',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BOOK_READ]
        },
        loadComponent: () =>
          import('./features/books/pages/book-list/book-list.component')
            .then(m => m.BookListComponent)
      },
      {
        path: 'books/create',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BOOK_WRITE]
        },
        loadComponent: () =>
          import('./features/books/pages/book-create/book-create.component')
            .then(m => m.BookCreateComponent)
      },
      {
        path: 'books/:id/edit',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BOOK_WRITE]
        },
        loadComponent: () =>
          import('./features/books/pages/book-edit/book-edit.component')
            .then(m => m.BookEditComponent)
      },
      {
        path: 'books/:id',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BOOK_READ]
        },
        loadComponent: () =>
          import('./features/books/pages/book-detail/book-detail.component')
            .then(m => m.BookDetailComponent)
      },

      /**
       * Inventory
       */
      {
        path: 'inventory',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.INVENTORY_READ]
        },
        loadComponent: () =>
          import('./features/inventory/pages/inventory-list/inventory-list.component')
            .then(m => m.InventoryListComponent)
      },
      {
        path: 'inventory/low-stock',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.INVENTORY_READ]
        },
        loadComponent: () =>
          import('./features/inventory/pages/low-stock/low-stock.component')
            .then(m => m.LowStockComponent)
      },
      {
        path: 'inventory/:bookId',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.INVENTORY_READ]
        },
        loadComponent: () =>
          import('./features/inventory/pages/inventory-detail/inventory-detail.component')
            .then(m => m.InventoryDetailComponent)
      },

      /**
       * Borrow Records
       */
      {
        path: 'borrow-records/create',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_WRITE]
        },
        loadComponent: () =>
          import('./features/borrow/pages/borrow-create/borrow-create.component')
            .then(m => m.BorrowCreateComponent)
      },
      {
        path: 'borrow-records',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_READ]
        },
        loadComponent: () =>
          import('./features/borrow/pages/borrow-list/borrow-list.component')
            .then(m => m.BorrowListComponent)
      },
      {
        path: 'borrow-records/:id',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_READ]
        },
        loadComponent: () =>
          import('./features/borrow/pages/borrow-detail/borrow-detail.component')
            .then(m => m.BorrowDetailComponent)
      },
      {
        path: 'my-borrows',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_READ]
        },
        loadComponent: () =>
          import('./features/borrow/pages/my-borrows/my-borrows.component')
            .then(m => m.MyBorrowsComponent)
      },

      /**
       * Fines
       */
      {
        path: 'fines',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_READ]
        },
        loadComponent: () =>
          import('./features/fines/pages/fine-list/fine-list.component')
            .then(m => m.FineListComponent)
      },
      {
        path: 'fines/:borrowRecordId',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_READ]
        },
        loadComponent: () =>
          import('./features/fines/pages/fine-detail/fine-detail.component')
            .then(m => m.FineDetailComponent)
      },

      /**
       * Notifications
       */
      {
        path: 'notifications',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.BORROW_READ]
        },
        loadComponent: () =>
          import('./features/notifications/pages/notification-list/notification-list.component')
            .then(m => m.NotificationListComponent)
      },

      /**
       * Users
       *
       * Important:
       * users/create must come before users/:id
       */
      {
        path: 'users/create',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.USER_WRITE]
        },
        loadComponent: () =>
          import('./features/users/pages/user-create/user-create.component')
            .then(m => m.UserCreateComponent)
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.USER_READ]
        },
        loadComponent: () =>
          import('./features/users/pages/user-list/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'users/:id/edit',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.USER_WRITE]
        },
        loadComponent: () =>
          import('./features/users/pages/user-edit/user-edit.component')
            .then(m => m.UserEditComponent)
      },
      {
        path: 'users/:id',
        canActivate: [permissionGuard],
        data: {
          permissions: [PERMISSIONS.USER_READ]
        },
        loadComponent: () =>
          import('./features/users/pages/user-detail/user-detail.component')
            .then(m => m.UserDetailComponent)
      }
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
