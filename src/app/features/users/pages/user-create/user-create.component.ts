import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AdminUserApiService } from '../../services/admin-user-api.service';
import { AdminCreateUserRequest } from '../../models/admin-create-user-request.model';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly adminUserApiService = inject(AdminUserApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  isSaving = false;
  showPassword = false;

  roles = [
    { value: 'MEMBER', label: 'Member' },
    { value: 'LIBRARIAN', label: 'Librarian' }
  ];

  userForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['MEMBER', [Validators.required]]
  });

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.value;

    const request: AdminCreateUserRequest = {
      fullName: value.fullName ?? '',
      email: value.email ?? '',
      phone: value.phone ?? '',
      password: value.password ?? '',
      role: value.role as 'MEMBER' | 'LIBRARIAN'
    };

    this.isSaving = true;

    this.adminUserApiService.createUser(request)
      .subscribe({
        next: response => {
          this.toastr.success('User created successfully');
          this.router.navigate(['/app/users', response.id]);
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get fullNameInvalid(): boolean {
    const control = this.userForm.controls.fullName;
    return control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.userForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.userForm.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

  get roleInvalid(): boolean {
    const control = this.userForm.controls.role;
    return control.invalid && (control.dirty || control.touched);
  }
}