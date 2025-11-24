/**
 * Modelo para manejar la estructura de respuesta estándar del backend.
 */
export interface ApiResponse<T> {
  success: boolean; // Indica si la operación fue exitosa
  message: string; // Mensaje del backend
  data: T; // Datos devueltos por el backend
}