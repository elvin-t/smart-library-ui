import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userApiService = inject(UserApiService);
  private readonly toastr = inject(ToastrService);

  userId!: number;
  user?: User;

  membershipTypes = MEMBERSHIP_TYPES;
  membershipStatuses = MEMBERSHIP_STATUSES;

  isLoading = false;
  isSaving = false;

  userForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phone: ['', [Validators.maxLength(20)]],
    membershipType: ['', [Validators.required]],
    membershipStatus: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading = true;

    this.userApiService.getUserById(this.userId)
      .subscribe({
        next: response => {
          this.user = response;

          this.userForm.patchValue({
            fullName: response.fullName,
            phone: response.phone ?? '',
            membershipType: response.membershipType,
            membershipStatus: response.membershipStatus
          });

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  save(): void {
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

    this.isSaving = true;

    this.userApiService.updateUser(this.userId, updateRequest)
      .subscribe({
        next: () => {
          this.updateStatus(statusRequest);
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }

  private updateStatus(statusRequest: UpdateUserStatusRequest): void {
    this.userApiService.updateUserStatus(this.userId, statusRequest)
      .subscribe({
        next: response => {
          this.toastr.success('User updated successfully');
          this.router.navigate(['/app/users', response.id]);
        },
        error: () => {
          this.isSaving = false;
        }
      });
  }
}