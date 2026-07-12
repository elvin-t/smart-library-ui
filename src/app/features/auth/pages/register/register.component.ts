import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
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
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly registerForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  readonly formValue = toSignal(this.registerForm.valueChanges, {
    initialValue: this.registerForm.getRawValue()
  });

  readonly passwordsMatch = computed(() => {
    const value = this.formValue();

    return value.password === value.confirmPassword;
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

    const value = this.registerForm.getRawValue();

    const request: RegisterRequest = {
      fullName: value.fullName,
      email: value.email,
      phone: value.phone,
      password: value.password
    };

    this.isLoading.set(true);

    this.authService.register(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Registration successful. Please login.');
          this.router.navigate(['/login']);
        }
      });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(value => !value);
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
