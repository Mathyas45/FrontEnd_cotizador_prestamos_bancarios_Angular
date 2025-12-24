import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * =====================================================
 * AUTH GUARD - Protector de Rutas
 * =====================================================
 * 
 * Los Guards son "guardianes" que Angular ejecuta ANTES
 * de cargar una ruta. Deciden si el usuario puede
 * acceder o no.
 * 
 * TIPOS DE GUARDS:
 * - CanActivate: ¿Puede acceder a la ruta?
 * - CanDeactivate: ¿Puede salir de la ruta?
 * - CanLoad: ¿Puede cargar el módulo lazy?
 * 
 * BUENAS PRÁCTICAS APLICADAS:
 * 1. Functional Guard (nuevo estilo Angular 15+)
 * 2. Inyección con inject() en lugar de constructor
 * 3. Redirección clara al login si no está autenticado
 */

/**
 * Guard funcional para proteger rutas privadas
 * 
 * USO en rutas:
 * {
 *   path: 'clientes',
 *   component: ClientesComponent,
 *   canActivate: [authGuard]  // <-- Así se usa
 * }
 * 
 * FLUJO:
 * 1. Usuario intenta acceder a ruta protegida
 * 2. Angular ejecuta este guard
 * 3. Si está autenticado → permite acceso (return true)
 * 4. Si NO está autenticado → redirige a login (return false)
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Inyectar servicios usando inject()
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    // ✅ Usuario autenticado, permitir acceso
    return true;
  }

  // ❌ Usuario NO autenticado
  alert('Acceso denegado. Por favor, inicie sesión.');
  console.log('Acceso denegado. Redirigiendo al login...');
  
  /**
   * Guardamos la URL que intentaba acceder
   * para redirigirlo después del login
   * 
   * Ejemplo: Intenta ir a /clientes → login → después del login → /clientes
   */
  const returnUrl = state.url;
  
  // Redirigir al login con la URL de retorno como parámetro
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl } 
  });
  
  return false;
};

/**
 * Guard para rutas públicas (login, register)
 * 
 * LÓGICA INVERSA: Si YA está logueado, redirige al dashboard
 * Evita que un usuario logueado vea el login de nuevo
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Ya está logueado, redirigir al dashboard
    console.log('Usuario ya autenticado, redirigiendo al dashboard...');
    router.navigate(['/sample-page']); // Cambia por tu ruta principal
    return false;
  }

  // No está logueado, puede ver login/register
  return true;
};
