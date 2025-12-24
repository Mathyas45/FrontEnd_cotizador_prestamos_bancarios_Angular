/**
 * =====================================================
 * AUTH MODELS - Interfaces de Autenticación
 * =====================================================
 * 
 * Archivo separado para interfaces relacionadas con autenticación.
 * Esto sigue el principio de separación de responsabilidades.
 * 
 * BUENA PRÁCTICA: Las interfaces van en archivos separados
 * dentro de la carpeta interface/ para:
 * 1. Facilitar su reutilización
 * 2. Mantener los servicios limpios
 * 3. Mejor organización del código
 */

/**
 * Datos que enviamos al backend para login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta que devuelve el backend tras login exitoso
 * 
 * ESTRUCTURA DEL BACKEND:
 * {
 *   success: true,
 *   message: "Login exitoso",
 *   data: {
 *     token: "eyJ...",
 *     type: "Bearer",
 *     username: "mathyas",
 *     email: "mathyas@gmail.com",
 *     roles: ["ADMIN"],
 *     permissions: ["READ_CLIENTS", "CREATE_CLIENTS", ...]
 *   }
 * }
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

/**
 * Datos de autenticación dentro de la respuesta
 */
export interface AuthData {
  token: string;
  type: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];  // ← NUEVO: Permisos vienen del backend
}

/**
 * Información del usuario que guardamos en localStorage
 * Incluye permisos para no depender del mapeo en frontend
 */
export interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  permissions: string[];  // ← NUEVO: Guardamos permisos del backend
}
