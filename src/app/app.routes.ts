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
       * Book page
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
  path: 'books/:id',
  canActivate: [permissionGuard],
  data: {
    permissions: [PERMISSIONS.BOOK_READ]
  },
  loadComponent: () =>
    import('./features/books/pages/book-detail/book-detail.component')
      .then(m => m.BookDetailComponent)
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


         /**
       * Inventory page
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
   * borrow-records
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
