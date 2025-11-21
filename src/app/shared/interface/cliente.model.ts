/**
 * ============================================
 * MODELO DE DATOS: CLIENTE
 * ============================================
 * 
 * ADAPTADO AL MODELO REAL DEL BACKEND JAVA
 * Campos exactos de la entidad Cliente.java
 */

export interface Cliente {
  id?: number;
  nombreCompleto: string;
  documentoIdentidad: string;
  email: string;
  telefono?: string;
  ingresoMensual?: number; // BigDecimal en backend
  regEstado: number; // 1 = activo, 0 = inactivo
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * DTO para crear un nuevo cliente
 */
export interface ClienteCreateDto {
  nombreCompleto: string;
  documentoIdentidad: string;
  email: string;
  telefono?: string;
  ingresoMensual?: number;
  regEstado: number;
}

/**
 * DTO para actualizar un cliente existente
 */
export interface ClienteUpdateDto {
  nombreCompleto?: string;
  documentoIdentidad?: string;
  email?: string;
  telefono?: string;
  ingresoMensual?: number;
  regEstado?: number;
}
