import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';

// =====================================================
// INTERFACES - Importadas desde archivo separado
// =====================================================
import { LoginRequest, LoginResponse, UserInfo } from '../interface/auth.model';

/**
 * =====================================================
 * AUTH SERVICE - Servicio de Autenticación
 * =====================================================
 * 
 * Este servicio maneja toda la lógica de autenticación:
 * - Login/Logout
 * - Almacenamiento seguro del token JWT
 * - Estado de autenticación reactivo
 * - Información del usuario logueado
 * - PERMISOS: Los permisos vienen del BACKEND, no se mapean en frontend
 * 
 * BUENAS PRÁCTICAS APLICADAS:
 * 1. Token almacenado en localStorage (persiste al cerrar navegador)
 * 2. BehaviorSubject para estado reactivo
 * 3. Métodos puros y responsabilidad única
 * 4. Manejo de errores centralizado
 * 5. Interfaces en archivos separados (interface/)
 * 6. Permisos dinámicos desde backend (no hardcodeados)
 */

@Injectable({
  providedIn: 'root' // Disponible en toda la aplicación (Singleton)
})
export class AuthService {

  // =====================================================
  // CONFIGURACIÓN
  // =====================================================
  
  /**
   * URL base de tu API Java
   * IMPORTANTE: Cambia esto por la URL de tu backend
   */
  private readonly API_URL = 'http://localhost:8080/api/auth';
  
  /**
   * Claves para localStorage
   * Usamos constantes para evitar errores de tipeo
   */
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_info';

  // =====================================================
  // ESTADO REACTIVO
  // =====================================================
  
  /**
   * BehaviorSubject: Observable que mantiene el último valor
   * - Permite que cualquier componente se suscriba
   * - Emite el valor actual inmediatamente al suscribirse
   * - Ideal para estados que cambian (logueado/no logueado)
   */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getStoredUser());

  /**
   * Observables públicos (solo lectura)
   * Los componentes se suscriben a estos para reaccionar a cambios
   */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar token al iniciar la aplicación
    this.checkTokenOnInit();
  }

  // =====================================================
  // MÉTODOS PÚBLICOS - API del servicio
  // =====================================================

  /**
   * Realiza el login contra el backend
   * 
   * @param credentials - email y password
   * @returns Observable con la respuesta del servidor
   * 
   * FLUJO:
   * 1. Envía credenciales al backend
   * 2. Recibe token JWT
   * 3. Guarda token y datos del usuario
   * 4. Actualiza estado de autenticación
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        // tap: Ejecuta efectos secundarios sin modificar el valor
        tap(response => {
          this.handleSuccessfulLogin(response);
        }),
        // catchError: Maneja errores de manera centralizada
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   * 
   * FLUJO:
   * 1. Limpia localStorage
   * 2. Actualiza estado a no autenticado
   * 3. Redirige al login
   */
  logout(): void {
    // Limpiar almacenamiento
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Actualizar estado reactivo
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Redirigir al login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtiene el token JWT almacenado
   * 
   * @returns Token o null si no existe
   * 
   * USO: El interceptor HTTP usa esto para añadir
   * el token a cada petición
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está autenticado
   * 
   * @returns true si hay token válido
   * 
   * USO: El AuthGuard usa esto para proteger rutas
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Obtiene información del usuario actual
   * 
   * @returns Datos del usuario o null
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el email del usuario actual
   * 
   * @returns email o string vacío
   */
  getUsername(): string {
    return this.getCurrentUser()?.username || '';
  }
  getRole(): string {
    return this.getCurrentUser()?.roles[0] || '';
  }

  // =====================================================
  // MÉTODOS PRIVADOS - Lógica interna
  // =====================================================

  /**
   * Procesa un login exitoso
   * 
   * @param response - Respuesta del backend
   * 
   * IMPORTANTE: Los permisos vienen directamente del backend
   * NO mapeamos roles a permisos en el frontend
   */
  private handleSuccessfulLogin(response: LoginResponse): void {
    // Guardar token
    localStorage.setItem(this.TOKEN_KEY, response.data.token);

    // Crear objeto de usuario CON PERMISOS del backend
    const userInfo: UserInfo = {
      username: response.data.username,
      email: response.data.email,
      roles: response.data.roles,
      permissions: response.data.permissions  // ← NUEVO: Guardamos permisos del backend
    };

    // Guardar info del usuario (incluye permisos)
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));

    // Actualizar estados reactivos para reflejar el login
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(userInfo);
    
    console.log('✅ Login exitoso');
    console.log('👤 Usuario:', userInfo.username);
    console.log('🔐 Roles:', userInfo.roles);
    console.log('📋 Permisos del backend:', userInfo.permissions);
  }

  /**
   * Verifica si existe un token válido
   * 
   * @returns true si el token existe y no ha expirado
   * 
   * NOTA: Para una validación más robusta, deberías
   * decodificar el JWT y verificar la fecha de expiración
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    // Verificar si el token ha expirado
    // Los JWT tienen 3 partes separadas por puntos: header.payload.signature
    try {
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        // exp está en segundos, Date.now() en milisegundos
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate > new Date();
      }
      return true; // Si no hay exp, asumimos que es válido
    } catch {
      return false;
    }
  }

  /**
   * Decodifica el payload del JWT
   * 
   * @param token - Token JWT
   * @returns Payload decodificado o null
   * 
   * NOTA: Esto NO verifica la firma, solo decodifica
   * La verificación real la hace el backend
   */
  private decodeToken(token: string): any {
    try {
      // El payload es la segunda parte del JWT
      const payload = token.split('.')[1];
      // Decodificar de Base64
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /**
   * Obtiene usuario almacenado en localStorage
   */
  private getStoredUser(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica el token al iniciar la aplicación
   * Si el token expiró, hace logout automático
   */
  private checkTokenOnInit(): void {
    if (this.getToken() && !this.hasValidToken()) {
      console.log('Token expirado, cerrando sesión...');
      this.logout();
    }
  }
}
