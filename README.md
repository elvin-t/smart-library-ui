# Smart Library Platform Frontend

> Angular-based frontend application for the Smart Library Platform, focused on role-based user experience, permission-based navigation, secure authentication, and clean UI workflows for Admin, Librarian, and Member users.

---

## Table of Contents

- [Overview](#overview)
- [Frontend Purpose](#frontend-purpose)
- [Application Features](#application-features)
- [Role-Based UI Behavior](#role-based-ui-behavior)
- [Technology Stack](#technology-stack)
- [Project Folder Structure](#project-folder-structure)
- [Application Routing](#application-routing)
- [Authentication Flow](#authentication-flow)
- [Authorization and Permissions](#authorization-and-permissions)
- [Core Modules](#core-modules)
- [Feature Modules](#feature-modules)
- [Reusable Shared Components](#reusable-shared-components)
- [HTTP Interceptors](#http-interceptors)
- [UI Pages](#ui-pages)
- [Environment Configuration](#environment-configuration)
- [Run Locally](#run-locally)
- [Docker Setup](#docker-setup)
- [Demo Flow](#demo-flow)
- [Manager Demo Script](#manager-demo-script)
- [Completed Milestones](#completed-milestones)
- [Future Improvements](#future-improvements)

---

## Overview

**Smart Library Platform Frontend** is an Angular application built to provide a clean, secure, and role-based user interface for library operations.

The frontend supports:

```text
Login
JWT-based session handling
Permission-based navigation
Role-based dashboard
Book management UI
Inventory management UI
Borrow and return workflow UI
Fine and penalty tracking UI
Notification viewing UI
User management UI
Admin create user flow
Admin activate/deactivate user login flow
Reusable UI components
Dockerized production deployment using Nginx
```

---

## Frontend Purpose

The purpose of this Angular application is to provide a single user interface for different types of library users.

The application behaves differently based on logged-in user role and permissions:

```text
ADMIN      → complete management access
LIBRARIAN  → book, inventory, borrow, fine, and notification operations
MEMBER     → browse books, borrow records, fines, and notifications
```

The frontend focuses on:

```text
Clean user experience
Role-based menu display
Permission-based action buttons
Reusable UI components
Secure API integration
Production-ready folder structure
Demo-ready user flows
```

---

## Application Features

```text
✅ Login page
✅ JWT token storage
✅ Auth interceptor
✅ Error interceptor
✅ Trace ID interceptor
✅ Auth guard
✅ Permission guard
✅ Role-based sidebar
✅ Permission-based dashboard cards
✅ Permission-based quick actions
✅ Book module
✅ Inventory module
✅ Borrow module
✅ Fine module
✅ Notification module
✅ User module
✅ Admin create user
✅ Admin activate/deactivate user login
✅ Reusable shared UI components
✅ Docker + Nginx setup
```

---

## Role-Based UI Behavior

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
```

Admin can perform:

```text
Create Member or Librarian
Update user profile
Update membership status
Activate user login
Deactivate user login
Create books
Edit books
Delete books
Manage inventory
View borrow records
Return books
View fines
Mark fines as paid
View notifications
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
```

Librarian can perform:

```text
View books
Create and update books if permitted
Manage inventory
View borrow records
Return books
View fines
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
```

Member can perform:

```text
Browse books
Borrow book if permitted
View own borrow records
Return own borrowed book if permitted
View own fines
View own notifications
```

---

## Technology Stack

```text
Angular
TypeScript
Standalone Components
Angular Router
Angular Reactive Forms
Angular HTTP Client
Functional HTTP Interceptors
Bootstrap
Bootstrap Icons
ngx-toastr
SCSS
JWT Decode
Docker
Nginx
```

---

## Project Folder Structure

```text
smart-library-ui/
├── src/
│   ├── app/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
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
│   │   │   │   ├── api-response.model.ts
│   │   │   │   ├── dashboard-card.model.ts
│   │   │   │   ├── error-response.model.ts
│   │   │   │   ├── page-response.model.ts
│   │   │   │   ├── quick-action.model.ts
│   │   │   │   └── sidebar-menu.model.ts
│   │   │   │
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── loading.service.ts
│   │   │       ├── permission.service.ts
│   │   │       ├── storage.service.ts
│   │   │       └── token.service.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── page-header/
│   │   │   │   └── status-badge/
│   │   │   │
│   │   │   ├── directives/
│   │   │   │   └── has-permission.directive.ts
│   │   │   │
│   │   │   ├── pipes/
│   │   │   │   ├── currency-format.pipe.ts
│   │   │   │   └── date-time.pipe.ts
│   │   │   │
│   │   │   └── services/
│   │   │       └── confirm-dialog.service.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── header/
│   │   │   ├── main-layout/
│   │   │   └── sidebar/
│   │   │
│   │   └── features/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── books/
│   │       ├── inventory/
│   │       ├── borrow/
│   │       ├── fines/
│   │       ├── notifications/
│   │       └── users/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── styles.scss
│
├── Dockerfile
├── nginx.conf
├── .dockerignore
├── angular.json
├── package.json
└── README.md
```

---

## Application Routing

The application uses route guards to protect secured pages.

Main route groups:

```text
/login
/access-denied
/app/dashboard
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

Route protection:

```text
authGuard       → checks whether user is logged in
permissionGuard → checks whether user has required permission
```

---

## Authentication Flow

```text
User opens login page
  ↓
User enters email and password
  ↓
Frontend calls login API
  ↓
JWT token is received
  ↓
Token is stored in session storage
  ↓
User is redirected to dashboard
  ↓
Auth interceptor adds token for secured API calls
```

Session storage key:

```text
smart_library_token
```

---

## Authorization and Permissions

The frontend supports permission-based UI display.

Common permissions:

```text
USER_READ
USER_WRITE
BOOK_READ
BOOK_WRITE
INVENTORY_READ
INVENTORY_WRITE
BORROW_READ
BORROW_WRITE
RETURN_READ
RETURN_WRITE
```

Permission usage examples:

```text
BOOK_READ        → show Books menu and book list
BOOK_WRITE       → show Add Book/Edit/Delete buttons
INVENTORY_READ   → show Inventory menu
INVENTORY_WRITE  → show Add/Remove/Adjust inventory actions
BORROW_READ      → show Borrow Records/My Borrows/Fines
BORROW_WRITE     → show Borrow Book action
RETURN_WRITE     → show Return Book / Mark Fine Paid action
USER_READ        → show Users menu
USER_WRITE       → show Create/Edit/Activate/Deactivate user actions
```

> Frontend permission checks are for UI behavior only. Final access control must always be enforced by protected APIs.

---

## Core Modules

### Core Constants

```text
api-endpoints.ts   → API endpoint constants
app-routes.ts      → route constants
permissions.ts     → permission constants
roles.ts           → role constants
```

### Core Guards

```text
auth.guard.ts       → blocks unauthenticated users
permission.guard.ts → blocks users without required permission
```

### Core Services

```text
AuthService       → login/logout and session operations
TokenService      → token storage, decoding, expiry validation
StorageService    → session storage wrapper
PermissionService → role and permission checks
LoadingService    → global loading support
```

---

## Feature Modules

## Auth Module

Includes:

```text
Login page
Access denied page
Auth API service
Login request model
Auth response model
```

Pages:

```text
/login
/access-denied
```

---

## Dashboard Module

The dashboard behaves differently based on role.

Dashboard cards:

```text
Users
Books
Low Stock
Borrow Records
Pending Fines
Notifications
```

Quick actions:

```text
Add Book
Manage Inventory
View Users
Borrow Records
Browse Books
My Borrows
My Fines
```

Admin dashboard:

```text
Shows admin control panel
Shows user management actions
Shows all permitted cards
```

Librarian dashboard:

```text
Shows librarian workspace
Shows book, inventory, borrow, fine actions
```

Member dashboard:

```text
Shows member portal
Shows browse books, my borrows, my fines actions
```

---

## Books Module

Features:

```text
View book list
Search books
Filter by genre
View book details
Create book
Edit book
Delete book
Permission-based action buttons
```

Pages:

```text
/app/books
/app/books/create
/app/books/:id
/app/books/:id/edit
```

Models:

```text
Book
BookGenre
CreateBookRequest
UpdateBookRequest
```

---

## Inventory Module

Features:

```text
Search inventory by book ID
View inventory details
View total copies
View available copies
View borrowed copies
Add copies
Remove copies
Adjust available copies
View low-stock books
```

Pages:

```text
/app/inventory
/app/inventory/low-stock
/app/inventory/:bookId
```

Models:

```text
Inventory
AddCopiesRequest
RemoveCopiesRequest
AdjustAvailableCopiesRequest
```

---

## Borrow Module

Features:

```text
Create borrow record
View all borrow records
View own borrow records
Filter borrow records by status
View borrow details
Return book
View fine details
Mark fine as paid
```

Pages:

```text
/app/borrow-records
/app/borrow-records/create
/app/borrow-records/:id
/app/my-borrows
```

Models:

```text
BorrowRequest
BorrowRecord
BorrowStatus
FineResponse
```

---

## Fines Module

Features:

```text
View fine records
Filter fines by status
View fine details
View overdue days
View fine amount
View payment status
Mark fine as paid
```

Pages:

```text
/app/fines
/app/fines/:borrowRecordId
```

Models:

```text
Fine
FineStatus
```

---

## Notifications Module

Features:

```text
View notifications
Filter notifications by type
Filter notifications by status
View notification message
View related user, book, and borrow record IDs
```

Pages:

```text
/app/notifications
```

Models:

```text
Notification
NotificationType
NotificationStatus
NotificationChannel
```

---

## Users Module

Features:

```text
View user list
Filter users by membership status
View user details
Edit user profile
Update membership type
Update membership status
Create Member or Librarian user
Activate user login
Deactivate user login
```

Pages:

```text
/app/users
/app/users/create
/app/users/:id
/app/users/:id/edit
```

Admin actions:

```text
Create user
Edit user
Activate login
Deactivate login
```

Models:

```text
User
MembershipType
MembershipStatus
UpdateUserRequest
UpdateUserStatusRequest
AdminCreateUserRequest
AdminCreateUserResponse
AdminUserStatusResponse
```

---

## Reusable Shared Components

### PageHeaderComponent

Used to display consistent page title, description, back button, and action button.

### LoadingSpinnerComponent

Used to display loading state for API requests.

### EmptyStateComponent

Used to display friendly message when a list has no records.

### StatusBadgeComponent

Used to display consistent status styles.

### ConfirmDialogService

Used as a central confirmation helper for delete, deactivate, return, and payment actions.

---

## HTTP Interceptors

### Auth Interceptor

Adds JWT token to secured API requests.

```text
Authorization: Bearer <token>
```

Supports both local and Docker/Nginx modes:

```text
http://localhost:8080/api/**
/api/**
```

---

### Trace Interceptor

Adds trace ID header to API requests.

```text
X-Trace-Id: <uuid>
```

---

### Error Interceptor

Handles common errors:

```text
401 → redirect to login
403 → redirect to access denied
0   → server unavailable message
Other errors → show API error message
```

---

## UI Pages

```text
Login Page
Access Denied Page
Dashboard Page
Book List Page
Book Detail Page
Book Create Page
Book Edit Page
Inventory List Page
Inventory Detail Page
Low Stock Page
Borrow Create Page
Borrow List Page
Borrow Detail Page
My Borrows Page
Fine List Page
Fine Detail Page
Notification List Page
User List Page
User Create Page
User Detail Page
User Edit Page
```

---

## Environment Configuration

## Local Development

`src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080'
};
```

## Docker / Production Build

`src/environments/environment.prod.ts`

```ts
export const environment = {
  production: true,
  apiBaseUrl: ''
};
```

In production mode, API requests use relative paths:

```text
/api/books
/api/users
/api/borrow-records
```

Nginx proxies those requests to the configured API entry point.

---

## Run Locally

Install dependencies:

```bash
npm install
```

Run Angular app:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

Production build:

```bash
npm run build -- --configuration production
```

---

## Docker Setup

### Dockerfile

The frontend uses a multi-stage Docker build:

```text
Stage 1: Build Angular app using Node
Stage 2: Serve static files using Nginx
```

### Run Docker Build

```bash
docker build -t smart-library-ui .
```

### Run Container

```bash
docker run -p 4200:80 smart-library-ui
```

Open:

```text
http://localhost:4200
```

---

## Nginx Routing

Nginx supports Angular browser refresh using:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Nginx proxies API calls:

```nginx
location /api/ {
    proxy_pass http://api-gateway:8080/api/;
}
```

---

## Demo Flow

## Admin Demo

```text
1. Login as Admin
2. Show full sidebar
3. Show Admin Dashboard
4. Open Users
5. Create Member or Librarian
6. Activate/deactivate login
7. Edit user profile
8. Open Books
9. Create/Edit/Delete book
10. Open Inventory
11. Add/Remove/Adjust copies
12. Open Borrow Records
13. Return book
14. Open Fines
15. Mark fine as paid
16. Open Notifications
```

---

## Librarian Demo

```text
1. Login as Librarian
2. Show limited sidebar
3. Open Books
4. Manage Inventory
5. View Borrow Records
6. Return book
7. View Fines
8. View Notifications
```

---

## Member Demo

```text
1. Login as Member
2. Show Member Dashboard
3. Browse Books
4. Borrow Book
5. View My Borrows
6. Return Book if allowed
7. View My Fines
8. View Notifications
```

---

## Manager Demo Script

```text
This is the Angular frontend for the Smart Library Platform.

The application is implemented using Angular standalone components with a clean feature-based folder structure.

After login, the application stores the JWT token and automatically attaches it to secured API requests using an HTTP interceptor.

The sidebar, dashboard cards, quick actions, routes, and buttons are displayed based on the logged-in user's roles and permissions.

Admin users can manage users, create Member or Librarian accounts, update user details, and activate or deactivate login access.

Librarians can manage books, inventory, borrow records, fines, and notifications based on their permissions.

Members can browse books, view their borrow records, check fines, and view notifications.

I also added reusable shared components like page header, loading spinner, empty state, status badge, date-time pipe, and currency pipe to keep the frontend clean and maintainable.

The frontend is also Docker-ready using a multi-stage Dockerfile and Nginx for production serving.
```

---

## Completed Milestones

```text
✅ Angular application setup
✅ Base folder structure
✅ Authentication flow
✅ JWT token handling
✅ Auth interceptor
✅ Trace interceptor
✅ Error interceptor
✅ Auth guard
✅ Permission guard
✅ Role-based sidebar
✅ Permission-based dashboard
✅ Book module
✅ Inventory module
✅ Borrow module
✅ Fine module
✅ Notification module
✅ User module
✅ Admin create user flow
✅ Admin activate/deactivate login flow
✅ Reusable shared components
✅ Global SCSS polish
✅ Dockerized Angular frontend
✅ Demo-ready UI
```

---

## Future Improvements

```text
1. Replace browser confirm with reusable modal dialog
2. Add advanced table sorting and column filters
3. Add dashboard charts
4. Add user role display in user list
5. Add login status from dedicated auth user status API
6. Add refresh token support
7. Add profile page
8. Add audit log UI
9. Add notification read/unread status
10. Add unit tests for guards, services, and components
```

---

## Final Summary

The Smart Library Angular frontend provides a complete role-based and permission-driven user interface for library operations.

The application supports secure login, JWT-based API access, dynamic navigation, role-specific dashboards, feature modules for books, inventory, borrow records, fines, notifications, and user management.

Admin users can create, update, activate, and deactivate users. Librarian and Member users receive different UI experiences based on permissions.

The frontend is structured for maintainability, reuse, and production deployment using Angular standalone components, shared UI components, interceptors, guards, SCSS styling, Docker, and Nginx.
