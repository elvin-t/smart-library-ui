# Smart Library Platform - Angular Frontend Documentation

> Production-ready Angular frontend for the Smart Library Platform. This application provides a role-based user interface for Admin, Librarian, and Member users to manage books, inventory, borrowing, fines, notifications, user profiles, and dashboard analytics.

---

## Table of Contents

- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
- [Technology Stack](#technology-stack)
- [Application Features](#application-features)
- [User Roles and UI Behavior](#user-roles-and-ui-behavior)
- [Project Folder Structure](#project-folder-structure)
- [Routing Structure](#routing-structure)
- [Core Module](#core-module)
- [Layout Module](#layout-module)
- [Shared Module](#shared-module)
- [Feature Modules](#feature-modules)
- [Authentication Flow](#authentication-flow)
- [Authorization and Permission-Based UI](#authorization-and-permission-based-ui)
- [HTTP Interceptors](#http-interceptors)
- [Dashboard Module](#dashboard-module)
- [Auth Module](#auth-module)
- [Book Module](#book-module)
- [Inventory Module](#inventory-module)
- [Borrow Module](#borrow-module)
- [Fine Module](#fine-module)
- [Notification Module](#notification-module)
- [User Module](#user-module)
- [Profile Module](#profile-module)
- [Reusable Confirmation Modal](#reusable-confirmation-modal)
- [Angular Environment Configuration](#angular-environment-configuration)
- [Local Development Setup](#local-development-setup)
- [Production Build](#production-build)
- [AWS S3 and CloudFront Deployment](#aws-s3-and-cloudfront-deployment)
- [Recommended Demo Flow](#recommended-demo-flow)
- [Completed Implementation Checklist](#completed-implementation-checklist)
- [Future Improvements](#future-improvements)

---

## Overview

The **Smart Library Platform Angular Frontend** is a single-page application built using Angular standalone components.

It supports:

```text
Login
Member self-registration
JWT token handling
Role-based sidebar
Permission-based actions
Dashboard summary cards
Book catalog management
Inventory management
Borrow and return workflows
Fine payment workflow
Notification read/unread workflow
Admin user management
Logged-in user profile page
Reusable confirmation modal
AWS S3 + CloudFront deployment readiness
```

The application is designed to work with the Smart Library backend through API Gateway.

---

## Frontend Architecture

```text
Angular SPA
   ↓
AuthInterceptor adds JWT token
   ↓
TraceInterceptor adds X-Trace-Id
   ↓
ErrorInterceptor handles API errors/toasters
   ↓
API Gateway
   ↓
Backend microservices
```

The frontend is organized using a feature-based folder structure:

```text
core       → guards, interceptors, constants, shared services
shared     → reusable UI components, pipes, directives, modal services
layout     → header, sidebar, main layout
features   → auth, dashboard, books, inventory, borrow, fines, notifications, users, profile
```

---

## Technology Stack

```text
Angular
TypeScript
Angular Standalone Components
Angular Router
Reactive Forms
Template-driven Forms where required
Angular HttpClient
Bootstrap
Bootstrap Icons
SCSS
ngx-toastr
JWT decode support
AWS S3 + CloudFront deployment support
```

---

## Application Features

```text
✅ Login
✅ Self-register as Member
✅ JWT token storage
✅ Automatic token injection
✅ Automatic trace ID injection
✅ Global API error toaster
✅ Role-based sidebar
✅ Permission-based buttons
✅ Dashboard summary API integration
✅ Book list, create, edit, detail, delete
✅ Borrow button from book detail page
✅ Inventory list with all books
✅ Inventory low-stock view
✅ Borrow create with available book dropdown
✅ My Borrows for logged-in Member
✅ Fine list and fine detail
✅ Mark fine as paid
✅ Notification list
✅ Notification read/unread
✅ Mark all notifications as read
✅ User search by name/email/phone
✅ Admin create Member/Librarian
✅ Admin activate/deactivate login
✅ Accurate login status from backend
✅ Logged-in user profile page
✅ Reusable confirmation modal
✅ Fixed layout scrolling: header/sidebar fixed, content scroll only
```

---

## User Roles and UI Behavior

### Admin

Admin can access:

```text
Dashboard
Users
Books
Inventory
Borrow Records
Fines
Notifications
Profile
```

Admin can perform:

```text
Create Member and Librarian users
Update user profile
Update membership status
Activate/deactivate user login
Create/update/delete books
Manage inventory
View all borrow records
Return books
View and pay fines
View notifications
View dashboard analytics
```

---

### Librarian

Librarian can access:

```text
Dashboard
Books
Inventory
Borrow Records
Fines
Notifications
Profile
```

Librarian can perform:

```text
Manage books depending on permissions
Manage inventory
View borrow records
Return books
View and manage fines
View notifications
```

---

### Member

Member can access:

```text
Dashboard
Books
My Borrows
Fines
Notifications
Profile
```

Member can perform:

```text
Browse books
Borrow available books
View own borrow records
Return own borrowed book if permitted
View own fines
View own notifications
Mark notifications as read
View own profile
```

Member should not access:

```text
User Management
Inventory Management
All Borrow Records
Admin user actions
Book create/edit/delete actions unless explicitly permitted
```

---

## Project Folder Structure

```text
smart-library-ui/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   │
│   │   ├── core/
│   │   │   ├── constants/
│   │   │   │   ├── api-endpoints.ts
│   │   │   │   ├── app-routes.ts
│   │   │   │   ├── permissions.ts
│   │   │   │   └── roles.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── permission.guard.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── trace.interceptor.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── error-response.model.ts
│   │   │   │   ├── page-response.model.ts
│   │   │   │   ├── dashboard-card.model.ts
│   │   │   │   ├── quick-action.model.ts
│   │   │   │   └── sidebar-menu.model.ts
│   │   │   │
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── token.service.ts
│   │   │       ├── storage.service.ts
│   │   │       ├── permission.service.ts
│   │   │       └── loading.service.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── page-header/
│   │   │   │   └── status-badge/
│   │   │   │
│   │   │   ├── directives/
│   │   │   │   └── has-permission.directive.ts
│   │   │   │
│   │   │   ├── pipes/
│   │   │   │   ├── date-time.pipe.ts
│   │   │   │   └── currency-format.pipe.ts
│   │   │   │
│   │   │   └── services/
│   │   │       └── confirm-dialog.service.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── main-layout/
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── books/
│   │       ├── inventory/
│   │       ├── borrow/
│   │       ├── fines/
│   │       ├── notifications/
│   │       ├── users/
│   │       └── profile/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── styles.scss
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Routing Structure

Main routes:

```text
/login
/register
/access-denied
/app/dashboard
/app/profile
/app/books
/app/books/create
/app/books/:id
/app/books/:id/edit
/app/inventory
/app/inventory/low-stock
/app/inventory/:bookId
/app/borrow-records
/app/borrow-records/create
/app/borrow-records/:id
/app/my-borrows
/app/fines
/app/fines/:borrowRecordId
/app/notifications
/app/users
/app/users/create
/app/users/:id
/app/users/:id/edit
```

Important route order:

```text
books/create before books/:id
books/:id/edit before books/:id
inventory/low-stock before inventory/:bookId
borrow-records/create before borrow-records/:id
users/create before users/:id
users/:id/edit before users/:id
```

---

## Core Module

The `core` folder contains application-wide logic.

### Constants

```text
api-endpoints.ts   → backend endpoint paths
permissions.ts     → permission constants
roles.ts           → role constants
app-routes.ts      → route constants if used
```

### Guards

```text
auth.guard.ts       → blocks unauthenticated access
permission.guard.ts → blocks access when required permission is missing
```

### Interceptors

```text
auth.interceptor.ts  → adds Authorization Bearer token
trace.interceptor.ts → adds X-Trace-Id
error.interceptor.ts → shows API error toaster and redirects when needed
```

### Services

```text
AuthService        → login/logout/register/session methods
TokenService       → token save/read/decode/expiry
StorageService     → storage wrapper
PermissionService  → role and permission checks
LoadingService     → optional loading state
```

---

## Layout Module

Layout structure:

```html
<div class="app-shell">
  <app-sidebar></app-sidebar>

  <div class="app-main">
    <app-header></app-header>

    <main class="app-content">
      <router-outlet></router-outlet>
    </main>
  </div>

  <app-confirm-dialog></app-confirm-dialog>
</div>
```

Layout behavior:

```text
Header fixed
Sidebar fixed
Only child page content scrolls
Reusable confirm modal is globally available
```

Recommended global CSS:

```scss
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}
```

---

## Shared Module

Shared reusable items:

```text
ConfirmDialogComponent
PageHeaderComponent
LoadingSpinnerComponent
EmptyStateComponent
StatusBadgeComponent
HasPermissionDirective
DateTimePipe
CurrencyFormatPipe
ConfirmDialogService
```

---

## Feature Modules

The application is split into feature folders:

```text
auth
profile
dashboard
books
inventory
borrow
fines
notifications
users
```

Each feature usually contains:

```text
models
services
pages
```

---

## Authentication Flow

```text
User opens /login
User enters email/password
Angular calls POST /api/auth/login
Backend returns JWT token
TokenService stores token
AuthInterceptor attaches token to secured API calls
User is redirected to /app/dashboard
```

Token storage key example:

```text
smart_library_token
```

---

## Authorization and Permission-Based UI

The UI uses permissions from JWT to show/hide routes and buttons.

Examples:

```text
USER_READ       → show Users menu/list
USER_WRITE      → show Create/Edit/Activate/Deactivate user actions
BOOK_READ       → show Books
BOOK_WRITE      → show Create/Edit/Delete book
INVENTORY_READ  → show Inventory page
INVENTORY_WRITE → show inventory actions
BORROW_READ     → show Borrow/Fines/Notifications
BORROW_WRITE    → show Borrow Book action
RETURN_WRITE    → show Return Book / Mark Fine Paid actions
DASHBOARD_READ  → access dashboard summary API
```

Frontend permission checks only improve UX. Backend/API Gateway remains the final security authority.

---

## HTTP Interceptors

### Auth Interceptor

Adds token:

```http
Authorization: Bearer <TOKEN>
```

### Trace Interceptor

Adds trace ID:

```http
X-Trace-Id: <uuid>
```

### Error Interceptor

Handles API errors:

```text
400 → validation warning toaster
401 → remove token and redirect login
403 → access denied toaster and redirect if required
409 → conflict warning toaster
0   → backend unavailable toaster
500 → generic error toaster
```

Example backend error:

```json
{
  "code": "AUTH_003",
  "message": "User already exists with email: elvin@gmail.com",
  "path": "/api/auth/register",
  "traceId": "82487dfa-ad50-4759-805b-edeee0adf740",
  "timestamp": "2026-07-10T19:49:42.2806275"
}
```

Frontend toaster displays:

```text
User already exists with email: elvin@gmail.com
```

---

## Dashboard Module

Dashboard now uses a backend summary API:

```http
GET /api/dashboard/summary
```

Angular service:

```text
DashboardApiService
DashboardService
```

Dashboard summary model:

```ts
export interface DashboardSummary {
  totalUsers: number;
  totalBooks: number;
  availableBooks: number;
  lowStockBooks: number;
  borrowRecords: number;
  pendingFines: number;
  notifications: number;
  memberView: boolean;
}
```

### Admin Dashboard Cards

```text
Users
Books
Low Stock
Borrow Records
Pending Fines
Notifications
```

### Librarian Dashboard Cards

```text
Books
Low Stock
Borrow Records
Pending Fines
Notifications
```

### Member Dashboard Cards

```text
Available Books
My Borrows
My Pending Fines
My Notifications
```

---

## Auth Module

Pages:

```text
/login
/register
/access-denied
```

### Login Page

Uses:

```http
POST /api/auth/login
```

### Register Page

Uses:

```http
POST /api/auth/register
```

Self-registration creates only `MEMBER` account.

Register request:

```json
{
  "email": "member1@library.com",
  "password": "member123",
  "fullName": "Member One",
  "phone": "9876543210"
}
```

---

## Book Module

Pages:

```text
/app/books
/app/books/create
/app/books/:id
/app/books/:id/edit
```

Features:

```text
View books
Search books
View book detail
Create book
Edit book
Delete book
Borrow button from book detail page
```

### Borrow Button from Book Detail

Book detail page shows:

```text
Borrow This Book
```

Only when:

```text
User has BORROW_WRITE
Book availableCopies > 0
Book available = true
```

Button navigates to:

```text
/app/borrow-records/create?bookId={id}
```

---

## Inventory Module

Pages:

```text
/app/inventory
/app/inventory/low-stock
/app/inventory/:bookId
```

Features:

```text
Display all books with stock
Search by title/author/ISBN
View total copies
View available copies
Calculate borrowed copies
Show Available / Low Stock / Out of Stock
Manage inventory per book
Add copies
Remove copies
Adjust available copies
```

Inventory list should display all books on page load. Search should filter or call book search API.

---

## Borrow Module

Pages:

```text
/app/borrow-records
/app/borrow-records/create
/app/borrow-records/:id
/app/my-borrows
```

Features:

```text
Create borrow record
Available books dropdown
Preselect book from query parameter
Member userId selected automatically from JWT
Admin/Librarian can enter member userId
View all borrow records for Admin/Librarian
View own borrow records for Member
Return book
View fine details
Mark fine as paid
```

Borrow create behavior:

```text
Member:
  userId hidden
  book dropdown shown
  redirect to /app/my-borrows after success

Admin/Librarian:
  userId field shown
  book dropdown shown
  redirect to borrow detail after success
```

Unavailable books should not be displayed in borrow dropdown.

---

## Fine Module

Pages:

```text
/app/fines
/app/fines/:borrowRecordId
```

Features:

```text
View fines
Filter by paid/unpaid if implemented
View fine detail
Show overdue days
Show fine amount
Mark fine as paid
```

---

## Notification Module

Page:

```text
/app/notifications
```

Features:

```text
View notifications
Show total/read/unread counts
Filter by notification type
Filter by notification status
Filter by read status
Mark notification as read
Mark all notifications as read
Highlight unread notifications
```

Supported read filter:

```text
All
Unread
Read
```

Recommended APIs:

```http
GET /api/notifications
GET /api/notifications/user/{userId}
PATCH /api/notifications/{id}/read
PATCH /api/notifications/user/{userId}/read-all
```

---

## User Module

Pages:

```text
/app/users
/app/users/create
/app/users/:id
/app/users/:id/edit
```

Features:

```text
View user list
Search by name/email/phone
Filter by membership status
Local pagination for direct array response
Create Member/Librarian user as Admin
View user detail
Edit user profile and membership
Activate/deactivate user login
Display accurate login active status from Auth Service
```

User Service response is profile data:

```json
[
  {
    "id": 1,
    "email": "admin@library.com",
    "fullName": "Admin User",
    "phone": "9876543210",
    "membershipType": "PREMIUM",
    "membershipStatus": "ACTIVE",
    "createdAt": "2026-07-01T15:30:26.074045",
    "updatedAt": "2026-07-01T15:30:26.074045"
  }
]
```

Login status comes from Auth Service:

```http
GET /api/auth/admin/users/statuses
GET /api/auth/admin/users/{userId}/status
```

Angular merges:

```text
User Service profile data + Auth Service active status
```

---

## Profile Module

Page:

```text
/app/profile
```

Features:

```text
View logged-in user profile
Show full name
Show email
Show phone
Show membership type/status
Show role from JWT
Show permissions from JWT
Back to dashboard
```

Profile page is protected by `authGuard` through parent `/app` route.

No separate permission guard is required because every logged-in user should view own profile.

---

## Reusable Confirmation Modal

The application uses `ConfirmDialogService` and `ConfirmDialogComponent` instead of browser `confirm()`.

Used for:

```text
Activate user
Deactivate user
Delete book
Return book
Mark fine as paid
Remove inventory copies
Mark all notifications as read
```

Example usage:

```ts
const confirmed = await this.confirmDialogService.confirm({
  title: 'Deactivate User Login',
  message: 'Are you sure you want to deactivate this user?',
  confirmText: 'Deactivate',
  cancelText: 'Cancel',
  variant: 'danger'
});
```

Variants:

```text
primary
success
warning
danger
```

---

## Angular Environment Configuration

### Local

`src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080'
};
```

### Production - Separate API Domain

`src/environments/environment.prod.ts`

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com'
};
```

### Production - Same Domain `/api/*`

```ts
export const environment = {
  production: true,
  apiBaseUrl: ''
};
```

If using CloudFront behavior `/api/*` to backend, keep `apiBaseUrl` empty.

---

## Local Development Setup

Install dependencies:

```bash
npm install
```

Run application:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

## Production Build

Build:

```bash
ng build --configuration production
```

Output folder may be:

```text
dist/smart-library-ui/browser
```

or:

```text
dist/smart-library-ui
```

based on Angular version/configuration.

---

## AWS S3 and CloudFront Deployment

Recommended production-grade frontend deployment:

```text
Angular build files
  ↓
Private S3 bucket
  ↓
CloudFront distribution
  ↓
Route 53 custom domain optional
  ↓
ACM HTTPS certificate optional for custom domain
```

For practice, the lowest-cost setup is:

```text
Private S3 + CloudFront default domain
```

No Docker or Nginx is required for Angular when deploying through S3 and CloudFront.

### Upload Script Example

```bash
#!/bin/bash

set -e

BUCKET_NAME="smart-library-ui-practice"
DISTRIBUTION_ID="<YOUR_CLOUDFRONT_DISTRIBUTION_ID>"
DIST_PATH="dist/smart-library-ui/browser"

echo "Building Angular app..."
ng build --configuration production

echo "Uploading assets with long cache..."
aws s3 sync "$DIST_PATH" "s3://$BUCKET_NAME" \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable" \
  --delete

echo "Uploading index.html with short cache..."
aws s3 cp "$DIST_PATH/index.html" "s3://$BUCKET_NAME/index.html" \
  --cache-control "public,max-age=60" \
  --content-type "text/html"

echo "Invalidating only index.html..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/index.html"

echo "Deployment completed."
```

### CloudFront SPA Routing

Configure custom error responses:

```text
403 → /index.html → 200
404 → /index.html → 200
```

This supports refresh/direct access for Angular routes like:

```text
/app/dashboard
/app/books/1
/app/users/1/edit
```

---

## Recommended Demo Flow

### Admin Demo

```text
1. Login as Admin
2. Show Admin Dashboard
3. Open User Management
4. Search user by name/email
5. Create Librarian or Member
6. Deactivate and activate user login
7. Open Books
8. Create/Edit/Delete book
9. Open Inventory
10. Manage stock
11. Open Borrow Records
12. Return book
13. Open Fines
14. Mark fine as paid
15. Open Notifications
16. Mark notifications as read
```

### Librarian Demo

```text
1. Login as Librarian
2. Show Librarian Dashboard
3. Open Books
4. Manage inventory
5. View borrow records
6. Return book
7. View fines
8. View notifications
```

### Member Demo

```text
1. Login as Member
2. Show Member Dashboard
3. Browse books
4. Open book detail
5. Click Borrow This Book
6. Borrow page opens with selected book
7. Borrow book
8. Open My Borrows
9. View fines
10. Open Notifications
11. Mark notification as read
12. Open My Profile
```

---

## Completed Implementation Checklist

```text
✅ Angular app structure
✅ Auth login
✅ Member self-register
✅ JWT token storage
✅ Auth interceptor
✅ Error interceptor
✅ Trace interceptor
✅ Auth guard
✅ Permission guard
✅ Role-based sidebar
✅ Fixed header/sidebar layout
✅ Dashboard summary API integration
✅ Admin/Librarian/Member dashboard cards
✅ Book management
✅ Borrow button from book detail
✅ Inventory all-books list
✅ Borrow create with available book dropdown
✅ My Borrows
✅ Fine list/detail
✅ Mark fine paid
✅ Notifications read/unread
✅ User search by name/email/phone
✅ Admin create user
✅ Admin activate/deactivate user
✅ Accurate login active status from backend
✅ Logged-in user profile page
✅ Reusable confirmation modal
✅ AWS S3 + CloudFront deployment ready
```

---

## Future Improvements

```text
Add charts to dashboard
Add notification badge in header
Add read/unread count in header
Add export to CSV/PDF
Add advanced table sorting
Add server-side pagination for users
Add profile edit for logged-in user
Add refresh token support
Add unit tests for guards/services/components
Add Cypress or Playwright E2E tests
Add CI/CD pipeline for S3 + CloudFront deployment
Add CloudFront invalidation workflow in GitHub Actions/Jenkins
```

---

## Final Summary

The Smart Library Angular application is a production-ready frontend for a role-based library management platform.

It supports Admin, Librarian, and Member workflows with secure JWT integration, route guards, permission-based UI, dashboard analytics, book and inventory management, borrow/return workflows, fines, notifications, user management, profile page, and AWS S3 + CloudFront deployment readiness.

The frontend is now suitable for:

```text
Local development
Manager demo
Portfolio showcase
AWS static hosting deployment
Production-grade extension
```
