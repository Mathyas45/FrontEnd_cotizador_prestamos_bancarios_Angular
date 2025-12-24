import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Menu } from '../interface/menu';
import { PermissionService, Permission } from './permission.service';
import { AuthService } from './auth.service';

/**
 * =====================================================
 * MENU SERVICE - Menú Dinámico basado en Permisos
 * =====================================================
 * 
 * Este servicio genera el menú de navegación dinámicamente
 * basándose en los permisos del usuario autenticado.
 * 
 * CARACTERÍSTICAS:
 * - Filtra ítems del menú según permisos
 * - Reactivo: se actualiza automáticamente al cambiar permisos
 * - Soporta menús anidados (children)
 * - Permisos vienen del BACKEND (dinámicos)
 * 
 * FLUJO:
 * 1. Usuario hace login → backend envía permisos
 * 2. PermissionService carga permisos
 * 3. MenuService filtra FULL_MENU según permisos
 * 4. Sidebar muestra solo ítems autorizados
 */

/**
 * Interfaz extendida del menú con soporte para permisos
 */
export interface MenuWithPermissions extends Menu {
  permissions?: string[];         // Permisos requeridos (strings del backend)
  permissionMode?: 'all' | 'any'; // 'all' = todos, 'any' = al menos uno
  roles?: string[];               // Alternativa: verificar por roles
  showForAll?: boolean;           // true = mostrar a todos, false/undefined = aplicar lógica de permisos
  children?: MenuWithPermissions[];
}

/**
 * Definición completa del menú con permisos
 * 
 * IMPORTANTE: Los valores de permissions[] deben coincidir
 * EXACTAMENTE con los que envía el backend
 * 
 * Puedes usar el enum Permission para type-safety
 * o strings directamente si el backend añade nuevos permisos
 */
const FULL_MENU: MenuWithPermissions[] = [
  // ========================================
  // SECCIÓN: PRINCIPAL
  // ========================================
  {
    main_title: 'main'
  },
  {
    path: '/dashboard',
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'home',
    type: 'link',
    bookmark: true,
    level: 1,
    // Accesible para todos los usuarios autenticados
    showForAll: true
  },

  // ========================================
  // SECCIÓN: PÁGINAS DE EJEMPLO (sin permisos)
  // ========================================
  {
    main_title: 'pages'
  },
  {
    path: '/sample-page',
    id: 'sample-page',
    title: 'sample_page',
    icon: 'sample-page',
    type: 'link',
    bookmark: true,
    level: 1,
    //solo visible si no tiene ningún permiso
    permissions: []
  },

  // ========================================
  // SECCIÓN: GESTIÓN
  // ========================================
  {
    main_title: 'management',
    permissions: ['READ_CLIENTS', 'READ_LOANS'],
    permissionMode: 'any'
  },
  
  // Módulo de Clientes
  {
    path: '/clientes',
    id: 'clientes',
    title: 'Clientes',
    icon: 'user',
    type: 'link',
    bookmark: true,
    level: 1,
    permissions: ['READ_CLIENTS'] // Solo visible si puede leer clientes
  },

  // Módulo de Solicitud de Préstamos
  {
    path: '/solicitud-prestamos',
    id: 'solicitud-prestamos',
    title: 'Solicitud de Préstamos',
    icon: 'file',
    type: 'link',
    bookmark: true,
    level: 1,
    permissions: ['READ_LOANS'] // Solo visible si puede ver préstamos
  },

  // ========================================
  // SECCIÓN: ADMINISTRACIÓN (solo admin/manager)
  // ========================================
  {
    main_title: 'administration',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
    permissionMode: 'any'
  },
  {
    id: 'admin-menu',
    title: 'Administración',
    icon: 'setting',
    type: 'sub',
    level: 1,
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
    permissionMode: 'any',
    children: [
      {
        path: '/admin/usuarios',
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        icon: 'user',
        type: 'link',
        level: 2,
        permissions: ['MANAGE_USERS']
      },
      {
        path: '/admin/roles',
        id: 'roles',
        title: 'Gestión de Roles',
        icon: 'setting',
        type: 'link',
        level: 2,
        permissions: ['MANAGE_ROLES']
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  /**
   * Menú filtrado según permisos del usuario
   */
  private menuSubject = new BehaviorSubject<Menu[]>([]);
  public menu$ = this.menuSubject.asObservable();

  constructor(
    private permissionService: PermissionService,
    private authService: AuthService
  ) {
    // Inicializar menú si ya hay usuario autenticado
    if (this.authService.isAuthenticated()) {
      this.updateMenu();
    }

    // Actualizar menú cuando cambian los permisos
    this.permissionService.permissions$.subscribe(permissions => {
      if (permissions.length > 0) {
        this.updateMenu();
      } else if (!this.authService.isAuthenticated()) {
        this.menuSubject.next([]);
      }
    });

    // También actualizar cuando cambia el estado de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        // Pequeño delay para asegurar que los permisos se cargaron
        setTimeout(() => this.updateMenu(), 100);
      } else {
        this.menuSubject.next([]);
      }
    });
  }

  /**
   * Obtiene el menú actual (sincrónico)
   */
  getMenu(): Menu[] {
    return this.menuSubject.value;
  }

  /**
   * Actualiza el menú filtrando por permisos
   */
  private updateMenu(): void {
    const filteredMenu = this.filterMenuByPermissions(FULL_MENU);
    this.menuSubject.next(filteredMenu);
    
    console.log('Menú actualizado:', filteredMenu);
  }

  /**
   * Filtra el menú recursivamente según permisos
   */
  private filterMenuByPermissions(items: MenuWithPermissions[]): Menu[] {
    return items
      .filter(item => this.hasAccessToMenuItem(item))
      .map(item => {
        // Si tiene hijos, filtrarlos también
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterMenuByPermissions(item.children);
          
          // Si después de filtrar no quedan hijos, no mostrar el padre
          if (filteredChildren.length === 0 && item.type === 'sub') {
            return null;
          }
          
          return {
            ...item,
            children: filteredChildren
          };
        }
        
        return { ...item };
      })
      .filter(item => item !== null) as Menu[];
  }

  /**
   * Verifica si el usuario tiene acceso a un ítem del menú
   */
  private hasAccessToMenuItem(item: MenuWithPermissions): boolean {
    // Si es un título de sección, verificar sus permisos si los tiene
    if (item.main_title) {
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }
      // Verificar permisos de la sección
      return item.permissionMode === 'any'
        ? this.permissionService.hasAnyPermission(item.permissions)
        : this.permissionService.hasAllPermissions(item.permissions);
    }

    // Si no tiene permisos definidos, verificar si es para todos o solo sin permisos
    if (!item.permissions || item.permissions.length === 0) {
      // Si showForAll es true, mostrar a todos los usuarios autenticados
      if (item.showForAll === true) {
        return true;
      }
      // Si no, mostrar solo si el usuario no tiene permisos
      const userPermissions = this.permissionService.getPermissions();
      return userPermissions.length === 0;
    }

    // Verificar según el modo
    if (item.permissionMode === 'any') {
      return this.permissionService.hasAnyPermission(item.permissions);
    }

    return this.permissionService.hasAllPermissions(item.permissions);
  }

  /**
   * Verifica si el usuario tiene acceso a una ruta específica
   * Útil para verificar acceso desde componentes
   */
  hasAccessToRoute(path: string): boolean {
    const menuItem = this.findMenuItemByPath(FULL_MENU, path);
    
    if (!menuItem) {
      return true; // Si no está en el menú, permitir por defecto
    }
    
    return this.hasAccessToMenuItem(menuItem);
  }

  /**
   * Busca un ítem del menú por su path
   */
  private findMenuItemByPath(items: MenuWithPermissions[], path: string): MenuWithPermissions | null {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      
      if (item.children) {
        const found = this.findMenuItemByPath(item.children, path);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }
}
