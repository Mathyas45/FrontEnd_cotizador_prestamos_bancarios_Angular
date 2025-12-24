import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserInfo } from '../interface/auth.model';

/**
 * =====================================================
 * PERMISSION SERVICE - Sistema de Autorización RBAC
 * =====================================================
 * 
 * Este servicio implementa Role-Based Access Control (RBAC)
 * que es el estándar de la industria para manejo de permisos.
 * 
 * ARQUITECTURA ACTUAL (Permisos Dinámicos):
 * - Usuario hace login
 * - Backend devuelve directamente los permisos del usuario
 * - NO hay mapeo de roles a permisos en frontend
 * - Los permisos controlan UI, rutas y botones
 * 
 * VENTAJAS DE PERMISOS DINÁMICOS:
 * 1. Fuente única de verdad (backend)
 * 2. Cambios de permisos sin redesplegar frontend
 * 3. Mayor flexibilidad en asignación de permisos
 * 4. Código frontend más limpio
 */

// =====================================================
// ENUMS - Para type-safety y autocompletado
// =====================================================

/**
 * Enum con todos los permisos del sistema
 * Usamos enum para:
 * 1. Autocompletado en el IDE
 * 2. Evitar errores de tipeo
 * 3. Documentar permisos disponibles
 * 
 * NOTA: Los valores deben coincidir EXACTAMENTE
 * con los que envía el backend
 */
export enum Permission {
  // Permisos de Clientes
  READ_CLIENTS = 'READ_CLIENTS',
  CREATE_CLIENTS = 'CREATE_CLIENTS',
  UPDATE_CLIENTS = 'UPDATE_CLIENTS',
  DELETE_CLIENTS = 'DELETE_CLIENTS',
  
  // Permisos de Préstamos
  READ_LOANS = 'READ_LOANS',
  CREATE_LOANS = 'CREATE_LOANS',
  UPDATE_LOANS = 'UPDATE_LOANS',
  DELETE_LOANS = 'DELETE_LOANS',
  SIMULATE_LOANS = 'SIMULATE_LOANS',
  APPROVE_LOANS = 'APPROVE_LOANS',
  REJECT_LOANS = 'REJECT_LOANS',
  
  // Permisos de Administración
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES'
}

/**
 * Enum con los roles del sistema
 * Solo para referencia, los permisos vienen del backend
 */
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST',
  USER = 'USER'
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  // =====================================================
  // ESTADO REACTIVO
  // =====================================================
  
  /**
   * BehaviorSubject con los permisos actuales del usuario
   * Se actualiza cuando el usuario hace login/logout
   * 
   * IMPORTANTE: Los permisos vienen del BACKEND
   * No hay mapeo de roles a permisos aquí
   */
  private permissionsSubject = new BehaviorSubject<string[]>([]);
  
  /**
   * Observable público de permisos
   * Los componentes pueden suscribirse para reaccionar a cambios
   */
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private authService: AuthService) {
    // Cargar permisos iniciales si ya hay usuario en localStorage
    this.initializePermissions();
    
    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadPermissionsFromUser(user);
      } else {
        this.clearPermissions();
      }
    });
  }

  /**
   * Inicializa los permisos al cargar la aplicación
   * Lee del localStorage si hay sesión guardada
   */
  private initializePermissions(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadPermissionsFromUser(user);
    }
  }

  // =====================================================
  // MÉTODOS PÚBLICOS - API del Servicio
  // =====================================================

  /**
   * Verifica si el usuario tiene UN permiso específico
   * 
   * @param permission - Permiso a verificar (string o enum)
   * @returns true si tiene el permiso
   * 
   * EJEMPLOS DE USO:
   * ```typescript
   * // Con enum (recomendado - type-safe)
   * if (this.permissionService.hasPermission(Permission.CREATE_CLIENTS)) { ... }
   * 
   * // Con string (flexible - útil si vienen permisos nuevos del backend)
   * if (this.permissionService.hasPermission('CREATE_CLIENTS')) { ... }
   * ```
   */
  hasPermission(permission: Permission | string): boolean {
    const permissions = this.permissionsSubject.value;
    return permissions.includes(permission);
  }

  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   * 
   * @param permissions - Array de permisos requeridos
   * @returns true si tiene TODOS los permisos
   * 
   * USO:
   * ```typescript
   * // Para mostrar sección que requiere múltiples permisos
   * canManageLoans = this.permissionService.hasAllPermissions([
   *   Permission.READ_LOANS,
   *   Permission.UPDATE_LOANS,
   *   Permission.APPROVE_LOANS
   * ]);
   * ```
   */
  hasAllPermissions(permissions: (Permission | string)[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos
   * 
   * @param permissions - Array de permisos
   * @returns true si tiene al menos uno
   * 
   * USO:
   * ```typescript
   * // Mostrar botón si puede aprobar O rechazar
   * canDecideOnLoan = this.permissionService.hasAnyPermission([
   *   Permission.APPROVE_LOANS,
   *   Permission.REJECT_LOANS
   * ]);
   * ```
   */
  hasAnyPermission(permissions: (Permission | string)[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * 
   * @param role - Rol a verificar
   * @returns true si tiene el rol
   * 
   * NOTA: Preferir hasPermission() sobre hasRole()
   * Los permisos son más granulares
   */
  hasRole(role: Role | string): boolean {
    const user = this.authService.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * 
   * @param roles - Array de roles
   * @returns true si tiene al menos uno
   */
  hasAnyRole(roles: (Role | string)[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Obtiene todos los permisos actuales del usuario
   * 
   * @returns Array de permisos como strings
   */
  getPermissions(): string[] {
    return this.permissionsSubject.value;
  }

  /**
   * Obtiene los roles del usuario actual
   * 
   * @returns Array de roles o array vacío
   */
  getRoles(): string[] {
    return this.authService.getCurrentUser()?.roles ?? [];
  }

  // =====================================================
  // MÉTODOS PRIVADOS
  // =====================================================

  /**
   * Carga los permisos DIRECTAMENTE desde el usuario
   * 
   * @param user - Usuario con permisos del backend
   * 
   * FLUJO:
   * 1. Backend envía permissions[] en login
   * 2. AuthService guarda en localStorage
   * 3. Este método lee y actualiza el BehaviorSubject
   * 
   * NO HAY MAPEO DE ROLES A PERMISOS
   * Los permisos ya vienen calculados del backend
   */
  private loadPermissionsFromUser(user: UserInfo): void {
    // Los permisos vienen directamente del backend
    const permissions = user.permissions || [];
    
    this.permissionsSubject.next(permissions);
    
    console.log('📋 Permisos cargados desde backend:');
    console.log('   - Usuario:', user.username);
    console.log('   - Roles:', user.roles);
    console.log('   - Permisos:', permissions);
  }

  /**
   * Limpia los permisos (usado en logout)
   */
  private clearPermissions(): void {
    this.permissionsSubject.next([]);
    console.log('🔓 Permisos limpiados (logout)');
  }
}
