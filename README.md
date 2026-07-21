# Smart Library Platform UI

Smart Library Platform UI is a modern Angular-based frontend application developed for the Smart Library Platform microservices backend. The application provides role-based screens and workflows for Admin, Librarian, and Member users to manage books, inventory, borrowing, returns, fines, notifications, and profile information.

The application is built using Angular 21 with standalone components, Signals, computed state, signal inputs, modern control flow syntax, JWT-based authentication, and permission-based UI rendering.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Application Roles](#application-roles)
- [Angular 21 Migration Highlights](#angular-21-migration-highlights)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [Feature Modules](#feature-modules)
- [Shared Components](#shared-components)
- [Authentication and Authorization](#authentication-and-authorization)
- [Role-Based Access Flow](#role-based-access-flow)
- [API Gateway Integration](#api-gateway-integration)
- [Environment Configuration](#environment-configuration)
- [Installation and Setup](#installation-and-setup)
- [Run Application](#run-application)
- [Build Application](#build-application)
- [Important Routes](#important-routes)
- [Frontend Best Practices Implemented](#frontend-best-practices-implemented)
- [Backend Services Used](#backend-services-used)
- [Kafka-Based Notification Flow](#kafka-based-notification-flow)
- [Future Enhancements](#future-enhancements)
- [Author](#author)
- [Project Status](#project-status)

---

## Overview

The Smart Library Platform UI is designed to provide a clean and responsive user experience for managing library operations. It communicates with the backend through an API Gateway and supports secure access using JWT tokens.

The application supports three main user roles:

- Admin
- Librarian
- Member

Each role has different permissions and access to different pages.

---

## Tech Stack

- Angular 21
- TypeScript
- Angular Signals
- Angular Standalone Components
- Angular Router
- Angular Reactive Forms
- Angular Template-driven Forms
- New Angular Control Flow Syntax
  - `@if`
  - `@for`
- Bootstrap 5
- Bootstrap Icons
- ngx-toastr
- RxJS
- JWT Authentication
- Role-Based Access Control
- Permission-Based UI Rendering

---

## Key Features

### Authentication

- User login
- Member registration
- JWT token storage
- Token-based session handling
- Logout functionality
- Protected routes

### Authorization

- Role-based route access
- Permission-based UI rendering
- Admin, Librarian, and Member specific menus
- Dynamic sidebar based on user role and permissions

### Book Management

- View book list
- Search books
- Filter books by genre
- View book details
- Create book
- Edit book
- Delete book
- Availability status display

### Inventory Management

- View book inventory
- Manage total copies
- Manage available copies
- Add copies
- Remove copies
- Adjust available copies
- View low-stock books
- Threshold-based low stock filtering

### Borrow Management

- Borrow book
- View borrow records
- View borrow details
- Return book
- Member-specific borrow records
- Admin/Librarian all borrow records view
- Role-based borrow record creation

### Fine Management

- View fine records
- View fine details
- Display overdue days
- Display fine amount
- Mark fine as paid
- Role-based fine visibility
  - Member sees own fines
  - Admin/Librarian sees all fines

### Notification Management

- View notifications
- Mark notification as read
- Mark all notifications as read
- Display unread count
- Kafka-based backend notification event support

### User Management

- View user list
- View user details
- Create user
- Edit user
- Activate user login
- Deactivate user login
- Profile page for logged-in user

---

## Application Roles

### Admin

Admin has full access to the platform.

Admin can:

- Manage users
- Manage books
- Manage inventory
- View all borrow records
- Return books
- Manage fines
- Mark fines as paid
- View notifications
- Access profile

---

### Librarian

Librarian can manage library operations but has limited user management access.

Librarian can:

- Manage books
- Manage inventory
- View all borrow records
- Return books
- Manage fines
- Mark fines as paid
- View notifications
- Access profile

---

### Member

Member has limited self-service access.

Member can:

- View books
- Borrow available books
- View own borrow records
- View own fines
- View notifications
- Access profile

Member cannot:

- View all users
- Manage inventory
- View all borrow records
- Manage other users' borrow records
- Mark fines as paid manually

---

## Angular 21 Migration Highlights

The application has been upgraded to use Angular 21 recommended patterns.

### Signals

Component state has been migrated from normal class properties to Angular Signals.

Example:

```ts
readonly isLoading = signal(false);
readonly books = signal<Book[]>([]);
readonly page = signal(0);
readonly totalPages = signal(0);
```

Template usage:

```html
@if (isLoading()) {
  <div>Loading...</div>
}

@for (book of books(); track book.id) {
  <div>{{ book.title }}</div>
}
```

---

### Computed Signals

Derived state is handled using `computed()`.

Example:

```ts
readonly selectedBook = computed(() => {
  const bookId = Number(this.selectedBookId());

  if (!bookId) {
    return undefined;
  }

  return this.availableBooks().find(book => book.id === bookId);
});
```

---

### Signal Inputs

Reusable components use signal-based inputs.

Example:

```ts
readonly status = input('');
```

Template:

```html
<span>{{ status() }}</span>
```

---

### Modern Control Flow

Old structural directives were migrated.

Before:

```html
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let book of books">{{ book.title }}</div>
```

After:

```html
@if (isLoading()) {
  <div>Loading...</div>
}

@for (book of books(); track book.id) {
  <div>{{ book.title }}</div>
}
```

---

### OnPush Change Detection

Components use `ChangeDetectionStrategy.OnPush` for better performance.

```ts
changeDetection: ChangeDetectionStrategy.OnPush
```

---

## Project Structure

```text
src/
└── app/
    ├── core/
    │   ├── constants/
    │   ├── guards/
    │   ├── interceptors/
    │   ├── models/
    │   └── services/
    │
    ├── features/
    │   ├── auth/
    │   ├── books/
    │   ├── borrow/
    │   ├── fines/
    │   ├── inventory/
    │   ├── notifications/
    │   └── users/
    │
    ├── layout/
    │   ├── header/
    │   └── sidebar/
    │
    ├── shared/
    │   ├── components/
    │   └── services/
    │
    ├── app.component.ts
    ├── app.routes.ts
    └── app.config.ts
```

---

## Core Modules

### Core Services

```text
core/services/
```

Includes:

- Auth service integration
- Token service
- Storage service
- Permission service
- HTTP interceptors
- Route guards

---

### Constants

```text
core/constants/
```

Includes:

- Roles
- Permissions

Example:

```ts
export const PERMISSIONS = {
  USER_READ: 'USER_READ',
  USER_WRITE: 'USER_WRITE',
  BOOK_READ: 'BOOK_READ',
  BOOK_WRITE: 'BOOK_WRITE',
  BORROW_READ: 'BORROW_READ',
  BORROW_WRITE: 'BORROW_WRITE',
  RETURN_READ: 'RETURN_READ',
  RETURN_WRITE: 'RETURN_WRITE',
  INVENTORY_READ: 'INVENTORY_READ',
  INVENTORY_WRITE: 'INVENTORY_WRITE'
};
```

---

## Feature Modules

### Auth Feature

```text
features/auth/
```

Pages:

- Login
- Register

Responsibilities:

- User login
- Member registration
- JWT token handling
- Redirect after login
- Logout support

---

### Books Feature

```text
features/books/
```

Pages:

- Book List
- Book Detail
- Book Create
- Book Edit

Features:

- Book search
- Genre filter
- Pagination
- Availability display
- Role-based create/edit/delete actions

---

### Inventory Feature

```text
features/inventory/
```

Pages:

- Inventory List
- Inventory Detail
- Low Stock

Features:

- View inventory
- Manage book copies
- Add/remove copies
- Adjust available copies
- Low-stock tracking

---

### Borrow Feature

```text
features/borrow/
```

Pages:

- Borrow List
- Borrow Detail
- Borrow Create
- My Borrows

Features:

- Borrow book
- Return book
- View borrow history
- Admin/Librarian all records view
- Member own records view
- Fine integration

---

### Fines Feature

```text
features/fines/
```

Pages:

- Fine List
- Fine Detail

Features:

- View overdue fines
- View fine details
- Mark fine as paid
- Member own fines view
- Admin/Librarian all fines view

---

### Notifications Feature

```text
features/notifications/
```

Pages:

- Notification List

Features:

- View notifications
- Mark notification as read
- Mark all notifications as read
- Display notification status

---

### Users Feature

```text
features/users/
```

Pages:

- User List
- User Detail
- User Create
- User Edit
- Profile

Features:

- View users
- Manage user status
- Activate/deactivate login access
- Profile management

---

## Shared Components

```text
shared/components/
```

Reusable components include:

- Confirm Dialog
- Page Header
- Status Badge

---

### Confirm Dialog

Reusable confirmation dialog used for:

- Delete book
- Return book
- Mark fine as paid
- Activate/deactivate user

Uses Angular Signals:

```ts
readonly isVisible = signal(false);
readonly request = signal<ConfirmDialogRequest | null>(null);
```

---

### Status Badge

Reusable status display component.

Used for:

- Borrow status
- Fine status
- Membership status
- Notification status

---

### Page Header

Reusable page heading component.

Supports:

- Title
- Description
- Back button
- Action button
- Action icon

---

## Authentication and Authorization

The application uses JWT token-based authentication.

After login:

```text
JWT token is stored in session storage
Token is sent in Authorization header
Permissions and roles are decoded from token
Routes and UI actions are controlled by role/permission
```

Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Role-Based Access Flow

### Sidebar Menu

Sidebar menu items are filtered using role and permission.

Example:

```ts
readonly visibleMenuItems = computed(() =>
  this.menuItems().filter(item =>
    this.permissionService.canDisplay(item.permissions, item.roles)
  )
);
```

---

### Member Flow

```text
Member logs in
  ↓
Sidebar shows Books, My Borrows, Fines, Notifications, Profile
  ↓
Member can borrow available books
  ↓
Borrow Create auto-selects logged-in userId
  ↓
Member sees only own borrow records and fines
```

---

### Admin/Librarian Flow

```text
Admin/Librarian logs in
  ↓
Sidebar shows management modules
  ↓
Can manage books, inventory, borrow records, returns, fines
  ↓
Can create borrow record for selected user
  ↓
Can view all borrow/fine records
```

---

## API Gateway Integration

The Angular application communicates with backend services through API Gateway.

Example base routes:

```text
/api/auth
/api/users
/api/books
/api/inventory
/api/borrow-records
/api/fines
/api/notifications
```

The API Gateway routes requests to individual backend services using service discovery.

---

## Environment Configuration

Example environment file:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080'
};
```

For production build:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-api-domain.com'
};
```

---

## Installation and Setup

### Prerequisites

Install:

```text
Node.js
npm
Angular CLI
Backend services running
```

Check versions:

```bash
node -v
npm -v
ng version
```

---

### Clone Repository

```bash
git clone <repository-url>
cd smart-library-platform-ui
```

---

### Install Dependencies

```bash
npm install
```

---

## Run Application

```bash
ng serve
```

Application runs at:

```text
http://localhost:4200
```

---

## Build Application

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production
```

Build output:

```text
dist/
```

---

## Important Routes

### Public Routes

```text
/login
/register
```

### Protected Routes

```text
/app/dashboard
/app/profile
/app/users
/app/books
/app/books/create
/app/books/:id
/app/books/:id/edit
/app/inventory
/app/inventory/:bookId
/app/inventory/low-stock
/app/borrow-records
/app/borrow-records/create
/app/borrow-records/:id
/app/my-borrows
/app/fines
/app/fines/:borrowRecordId
/app/notifications
```

---

## Frontend Best Practices Implemented

- Angular standalone components
- Angular Signals for component state
- Computed signals for derived values
- Signal inputs for reusable components
- New Angular control flow syntax
- OnPush change detection
- Role-based route protection
- Permission-based UI rendering
- JWT token interceptor
- Centralized permission service
- Reusable shared components
- Toast notifications
- Confirmation dialog
- Pagination
- Search and filtering
- Responsive Bootstrap layout
- Clear separation of features and shared code

---

## Backend Services Used

The UI integrates with the following backend services:

```text
API Gateway
Auth Service
User Service
Book Service
Inventory Service
Borrow Service
Notification Service
Eureka Discovery Server
Kafka
PostgreSQL
```

---

## Kafka-Based Notification Flow

The backend uses Kafka for asynchronous notification creation.

Example flow:

```text
Borrow Service publishes BookBorrowedEvent
  ↓
Kafka topic: book-borrowed-events
  ↓
Notification Service consumes event
  ↓
Notification record is created
  ↓
Angular displays notification using REST API
```

Kafka topics:

```text
book-borrowed-events
book-returned-events
fine-paid-events
```

The frontend does not directly interact with Kafka. It reads notifications through REST APIs.

---

## Sample Login Roles

```text
ADMIN
LIBRARIAN
MEMBER
```

---

## Example Permission-Based UI

```html
@if (hasPermission(permissions.BOOK_WRITE)) {
  <a routerLink="/app/books/create" class="btn btn-primary">
    Add Book
  </a>
}
```

---

## Example Signal-Based State

```ts
readonly books = signal<Book[]>([]);
readonly isLoading = signal(false);
readonly page = signal(0);
readonly totalPages = signal(0);
```

Template:

```html
@if (isLoading()) {
  <div class="spinner-border text-primary"></div>
}

@for (book of books(); track book.id) {
  <tr>
    <td>{{ book.title }}</td>
  </tr>
}
```

---

## Future Enhancements

- Add refresh token support
- Add forgot password flow
- Add email notification UI
- Add real-time notification badge
- Add dashboard charts
- Add Angular unit tests
- Add Cypress end-to-end tests
- Add dark mode support
- Add advanced book reservations
- Add payment gateway for member fine payment
- Add PWA support
- Add deployment pipeline using GitHub Actions or Jenkins

---

## Author

**MARIAELVIN**  
Senior Full Stack Developer  
Java | Spring Boot | Microservices | Angular | Kafka | AWS

---

## Project Status

```text
Status: Active Development
Frontend: Angular 21 migrated with Signals and new control flow
Backend: Spring Boot microservices with Kafka-based notification flow
```
