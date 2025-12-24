import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * =====================================================
 * AUTH INTERCEPTOR - Interceptor de Peticiones HTTP
 * =====================================================
 * 
 * Los Interceptores son "middleware" que Angular ejecuta
 * en CADA petición HTTP. Pueden modificar las peticiones
 * antes de enviarlas y las respuestas al recibirlas.
 * 
 * ¿PARA QUÉ SIRVE ESTE INTERCEPTOR?
 * 1. Añade automáticamente el token JWT a cada petición
 * 2. Maneja errores de autenticación (401, 403)
 * 3. Hace logout automático si el token expiró
 * 
 * FLUJO DE UNA PETICIÓN:
 * Componente → Interceptor → Backend → Interceptor → Componente
 *                  ↑                        ↑
 *           Añade token              Maneja errores
 * 
 * BUENAS PRÁCTICAS APLICADAS:
 * 1. Functional Interceptor (nuevo estilo Angular 15+)
 * 2. No intercepta rutas de autenticación
 * 3. Manejo centralizado de errores 401/403
 */

/**
 * Interceptor funcional de autenticación
 * 
 * CONFIGURACIÓN: Se registra en app.config.ts
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectar servicios
  const authService = inject(AuthService);
  const router = inject(Router);

  // =====================================================
  // 1. OBTENER TOKEN
  // =====================================================
  const token = authService.getToken();

  // =====================================================
  // 2. CLONAR Y MODIFICAR LA PETICIÓN
  // =====================================================
  /**
   * Las peticiones HTTP son inmutables (no se pueden modificar)
   * Por eso debemos CLONAR la petición y añadir los headers
   */
  let authReq = req;

  if (token) {
    /**
     * Añadimos el header Authorization con el formato Bearer
     * 
     * El formato "Bearer <token>" es un estándar de OAuth 2.0
     * Tu backend Java debe esperar este formato
     * 
     * Header resultante:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     */
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // =====================================================
  // 3. ENVIAR PETICIÓN Y MANEJAR ERRORES
  // =====================================================
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      /**
       * Manejo de errores de autenticación
       * 
       * 401 Unauthorized: Token inválido o expirado
       * 403 Forbidden: No tiene permisos para el recurso
       */
      if (error.status === 401) {
        console.error('Token expirado o inválido. Cerrando sesión...');
        authService.logout();
      }
      
      if (error.status === 403) {
        console.error('Acceso denegado. No tienes permisos.');
        // Opcional: redirigir a página de "sin permisos"
        // router.navigate(['/forbidden']);
      }

      // Re-lanzar el error para que el componente pueda manejarlo también
      return throwError(() => error);
    })
  );
};

/**
 * =====================================================
 * NOTAS IMPORTANTES PARA TU BACKEND JAVA
 * =====================================================
 * 
 * Tu backend debe:
 * 
 * 1. CORS: Permitir peticiones desde tu frontend Angular
 *    @CrossOrigin(origins = "http://localhost:4200")
 *    o configurar CORS globalmente
 * 
 * 2. Leer el header Authorization:
 *    String authHeader = request.getHeader("Authorization");
 *    if (authHeader != null && authHeader.startsWith("Bearer ")) {
 *        String token = authHeader.substring(7);
 *        // Validar token
 *    }
 * 
 * 3. Retornar códigos de estado correctos:
 *    - 200: Éxito
 *    - 401: No autenticado
 *    - 403: Sin permisos
 *    - 400: Error de validación
 *    - 500: Error del servidor
 */
