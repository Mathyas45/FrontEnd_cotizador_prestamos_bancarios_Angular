import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService, Permission } from '../services/permission.service';

/**
 * =====================================================
 * PERMISSION GUARD - Protección de Rutas por Permiso
 * =====================================================
 * 
 * Guard funcional que protege rutas basándose en permisos.
 * 
 * USO EN RUTAS:
 * 
 * {
 *   path: 'clientes/nuevo',
 *   component: ClienteFormComponent,
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['CREATE_CLIENTS'] }
 * }
 * 
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['MANAGE_USERS', 'MANAGE_ROLES'], mode: 'any' }
 * }
 */
export const permissionGuard: CanActivateFn = (route, state) => {// Inyectar servicios usando inject()
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Obtener permisos requeridos de la data de la ruta
  const requiredPermissions: string[] = route.data?.['permissions'] || [];
  const mode: 'all' | 'any' = route.data?.['permissionMode'] || 'all';

  // Si no hay permisos requeridos, permitir acceso
  if (requiredPermissions.length === 0) {
    return true;
  }

  let hasAccess: boolean;

  if (mode === 'any') {
    hasAccess = permissionService.hasAnyPermission(requiredPermissions);
  } else {
    hasAccess = permissionService.hasAllPermissions(requiredPermissions);
  }

  if (!hasAccess) {
    console.warn('Acceso denegado. Permisos requeridos:', requiredPermissions);
    console.warn('Permisos del usuario:', permissionService.getPermissions());
    
    // Redirigir a página de acceso denegado o dashboard
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};

/**
 * =====================================================
 * ROLE GUARD - Protección de Rutas por Rol
 * =====================================================
 * 
 * Guard funcional que protege rutas basándose en roles.
 * 
 * USO EN RUTAS:
 * 
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [roleGuard],
 *   data: { roles: ['ADMIN'] }
 * }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] || [];

  if (requiredRoles.length === 0) {
    return true;
  }

  const hasAccess = permissionService.hasAnyRole(requiredRoles);

  if (!hasAccess) {
    console.warn('Acceso denegado. Roles requeridos:', requiredRoles);
    console.warn('Roles del usuario:', permissionService.getRoles());
    
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};
