import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService, Permission } from '../services/permission.service';

/**
 * =====================================================
 * HAS PERMISSION DIRECTIVE
 * =====================================================
 * 
 * Directiva estructural para mostrar/ocultar elementos
 * basado en los permisos del usuario.
 * 
 * USOS EN HTML:
 * 
 * 1. Un solo permiso:
 *    <button *hasPermission="'CREATE_CLIENTS'">Nuevo Cliente</button>
 * 
 * 2. Múltiples permisos (debe tener TODOS):
 *    <button *hasPermission="['UPDATE_CLIENTS', 'DELETE_CLIENTS']">Editar</button>
 * 
 * 3. Cualquier permiso (debe tener AL MENOS UNO):
 *    <button *hasPermission="['APPROVE_LOANS', 'REJECT_LOANS']; mode: 'any'">Gestionar</button>
 * 
 * 4. Negar permiso (mostrar si NO tiene el permiso):
 *    <div *hasPermission="'ADMIN'; negate: true">Solo para no admins</div>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {

  private permissions: (Permission | string)[] = [];
  private mode: 'all' | 'any' = 'all';
  private negate: boolean = false;
  private subscription?: Subscription;
  private isVisible = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  /**
   * Input principal: permiso o array de permisos
   */
  @Input()
  set hasPermission(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  /**
   * Modo de verificación: 'all' (todos) o 'any' (cualquiera)
   */
  @Input()
  set hasPermissionMode(value: 'all' | 'any') {
    this.mode = value;
    this.updateView();
  }

  /**
   * Negar la condición: mostrar si NO tiene el permiso
   */
  @Input()
  set hasPermissionNegate(value: boolean) {
    this.negate = value;
    this.updateView();
  }

  ngOnInit(): void {
    // Suscribirse a cambios en permisos para actualizar la vista, suscribirse se refiere a escuchar cambios en los permisos del usuario
    this.subscription = this.permissionService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Actualiza la visibilidad del elemento
   */
  private updateView(): void {
    let hasAccess: boolean;

    if (this.mode === 'any') {
      hasAccess = this.permissionService.hasAnyPermission(this.permissions);
    } else {
      hasAccess = this.permissionService.hasAllPermissions(this.permissions);
    }

    // Aplicar negación si está configurada
    if (this.negate) {
      hasAccess = !hasAccess;
    }

    if (hasAccess && !this.isVisible) {
      // Mostrar elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasAccess && this.isVisible) {
      // Ocultar elemento
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}

/**
 * =====================================================
 * HAS ROLE DIRECTIVE
 * =====================================================
 * 
 * Directiva para mostrar/ocultar basado en roles
 * 
 * USOS EN HTML:
 * <button *hasRole="'ADMIN'">Solo Admin</button>
 * <div *hasRole="['ADMIN', 'MANAGER']">Admin o Manager</div>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {

  private roles: string[] = [];
  private subscription?: Subscription;
  private isVisible = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  @Input()
  set hasRole(value: string | string[]) {
    this.roles = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  ngOnInit(): void {
    this.subscription = this.permissionService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(): void {
    const hasAccess = this.permissionService.hasAnyRole(this.roles);

    if (hasAccess && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasAccess && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
