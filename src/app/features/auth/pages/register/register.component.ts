import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { RegisterRequest } from '../../models/register-request.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  registerForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      this.toastr.warning('Password and confirm password do not match');
      return;
    }

    const value = this.registerForm.value;

    const request: RegisterRequest = {
      fullName: value.fullName ?? '',
      email: value.email ?? '',
      phone: value.phone ?? '',
      password: value.password ?? ''
    };

    this.isLoading = true;

    this.authService.register(request)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toastr.success('Registration successful. Please login.');
          this.router.navigate(['/login']);
        }
      });
  }

  passwordsMatch(): boolean {
    return this.registerForm.value.password === this.registerForm.value.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get fullNameInvalid(): boolean {
    const control = this.registerForm.controls.fullName;
    return control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.registerForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  get phoneInvalid(): boolean {
    const control = this.registerForm.controls.phone;
    return control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.registerForm.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.registerForm.controls.confirmPassword;

    return (control.invalid && (control.dirty || control.touched)) ||
      (control.touched && !this.passwordsMatch());
  }
}
