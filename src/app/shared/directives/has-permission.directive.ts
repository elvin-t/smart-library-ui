import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges
} from '@angular/core';

import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnChanges {

  @Input('appHasPermission') permissions: string[] | string = [];

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainerRef: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnChanges(): void {
    this.updateView();
  }

  private updateView(): void {
    const permissionList = Array.isArray(this.permissions)
      ? this.permissions
      : [this.permissions];

    const hasPermission = this.permissionService.hasAnyPermission(permissionList);

    this.viewContainerRef.clear();

    if (hasPermission) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}