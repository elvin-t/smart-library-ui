import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { LoginRequest } from '../../models/login-request.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  /**
   * Converts reactive form status into a signal.
   * This helps Angular 21 + OnPush update the disabled button state safely.
   */
  readonly formStatus = toSignal(this.loginForm.statusChanges, {
    initialValue: this.loginForm.status
  });

  readonly isSubmitDisabled = computed(() =>
    this.formStatus() === 'INVALID' || this.isLoading()
  );

  login(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest = this.loginForm.getRawValue();

    this.isLoading.set(true);

    this.authService.login(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Login successful');
          this.router.navigate(['/app/dashboard']);
        }
      });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  get emailInvalid(): boolean {
    const control = this.loginForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }
}
