import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { UserApiService } from '../../services/user-api.service';
import { User } from '../../models/user.model';

import {
  MEMBERSHIP_TYPES
} from '../../models/membership-type.model';

import {
  MEMBERSHIP_STATUSES
} from '../../models/membership-status.model';

import { UpdateUserRequest } from '../../models/update-user-request.model';
import { UpdateUserStatusRequest } from '../../models/update-user-status-request.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userApiService = inject(UserApiService);
  private readonly toastr = inject(ToastrService);

  readonly userId = signal<number | null>(null);
  readonly user = signal<User | null>(null);

  readonly membershipTypes = MEMBERSHIP_TYPES;
  readonly membershipStatuses = MEMBERSHIP_STATUSES;

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly userForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', [Validators.maxLength(20)]],
    membershipType: ['', [Validators.required]],
    membershipStatus: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.userId.set(id);

    this.loadUser();
  }

  loadUser(): void {
    const id = this.userId();

    if (!id) {
      return;
    }

    this.isLoading.set(true);

    this.userApiService.getUserById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          this.user.set(response);

          this.userForm.patchValue({
            fullName: response.fullName,
            phone: response.phone ?? '',
            membershipType: response.membershipType,
            membershipStatus: response.membershipStatus
          });
        },
        error: () => {
          this.user.set(null);
        }
      });
  }

  save(): void {
    const id = this.userId();

    if (!id) {
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.value;

    const updateRequest: UpdateUserRequest = {
      fullName: value.fullName ?? '',
      phone: value.phone ?? '',
      membershipType: value.membershipType as any
    };

    const statusRequest: UpdateUserStatusRequest = {
      membershipStatus: value.membershipStatus as any
    };

    this.isSaving.set(true);

    this.userApiService.updateUser(id, updateRequest)
      .subscribe({
        next: () => {
          this.updateStatus(statusRequest);
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
  }

  private updateStatus(statusRequest: UpdateUserStatusRequest): void {
    const id = this.userId();

    if (!id) {
      this.isSaving.set(false);
      return;
    }

    this.userApiService.updateUserStatus(id, statusRequest)
      .subscribe({
        next: response => {
          this.toastr.success('User updated successfully');
          this.router.navigate(['/app/users', response.id]);
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
  }
}
