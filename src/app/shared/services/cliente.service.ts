/**
 * ============================================
 * SERVICIO: CLIENTE SERVICE
 * ============================================
 * 
 * Este servicio maneja TODAS las peticiones HTTP hacia el backend.
 * Es similar a un composable o store en Vue (como useFetch o axios).
 * 
 * CONCEPTO CLAVE en Angular:
 * - Los servicios son INYECTABLES (se pueden usar en cualquier componente)
 * - Se crean UNA SOLA VEZ y se comparten en toda la app (Singleton)
 * - Usan HttpClient para hacer peticiones HTTP
 * 
 * MÉTODOS QUE IMPLEMENTA:
 * - getAll() → GET /api/clientes
 * - getById(id) → GET /api/clientes/:id
 * - create(cliente) → POST /api/clientes
 * - update(id, cliente) → PUT /api/clientes/:id
 * - delete(id) → DELETE /api/clientes/:id
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Importamos los modelos que creamos
import { Cliente, ClienteCreateDto, ClienteUpdateDto } from '../interface/cliente.model';
import { ApiResponse } from '../interface/api-response.model';

/**
 * @Injectable: Decorador que hace que este servicio pueda ser inyectado
 * providedIn: 'root' → Se crea una única instancia para toda la app
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  // ========================================
  // CONFIGURACIÓN DEL BACKEND
  // ========================================
  
  /**
   * URL base del backend
   * IMPORTANTE: Cambia esto según tu configuración:
   * - Desarrollo local: http://localhost:8080/api
   * - Producción: https://tu-dominio.com/api
   */
  private apiUrl = 'http://localhost:8080/api/clientes';

  /**
   * Headers HTTP por defecto
   * Indicamos que enviamos y recibimos JSON
   */
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  /**
   * HttpClient se INYECTA automáticamente por Angular
   * Es el equivalente a axios en Vue
   */
  constructor(private http: HttpClient) { }

  // ========================================
  // MÉTODO 1: OBTENER TODOS LOS CLIENTES
  // ========================================
  
  /**
   * Obtiene el listado completo de clientes
   * 
   * @returns Observable<Cliente[]> → Un stream de datos que emite un array de clientes
   * 
   * NOTA: Observable es similar a una Promise en Vue, pero más potente
   * Para usarlo en el componente: this.clienteService.getAll().subscribe(...)
   */
  getAll(): Observable<Cliente[]> {
    return this.http.get<ApiResponse<Cliente[]>>(this.apiUrl)
      .pipe(
        map(response => {
          console.log('Respuesta del backend:', response.message);
          return response.data.map((cliente: Cliente) => ({
            ...cliente,
            createdAt: cliente.createdAt ? new Date(cliente.createdAt) : undefined,
            updatedAt: cliente.updatedAt ? new Date(cliente.updatedAt) : undefined
          }));
        }),
        catchError(this.handleError)
      );
  }

  // ========================================
  // MÉTODO 2: OBTENER UN CLIENTE POR ID
  // ========================================
  
  /**
   * Obtiene un cliente específico por su ID
   * 
   * @param id - ID del cliente a buscar
   * @returns Observable<Cliente> → Un stream que emite un solo cliente
   * 
   * Se usa para:
   * - Mostrar detalles de un cliente
   * - Cargar datos en el formulario de edición
   */
  getById(id: number): Observable<Cliente> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<Cliente>>(url)
      .pipe(
        map(response => {
          console.log('Mensaje del backend:', response.message);
          return {
            ...response.data,
            createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
            updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined
          };
        }),
        catchError(this.handleError)
      );
  }

  // ========================================
  // MÉTODO 3: CREAR UN NUEVO CLIENTE
  // ========================================
  
  /**
   * Crea un nuevo cliente en el backend
   * 
   * @param cliente - Datos del nuevo cliente
   * @returns Observable<Cliente> → El cliente creado (con ID asignado por el backend)
   * 
   * Envía un POST con los datos del formulario
   */
  create(cliente: ClienteCreateDto): Observable<string> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/register`, cliente, this.httpOptions)
      .pipe(
        map(response => response.message),
        catchError(this.handleError)
      );
  }

  // ========================================
  // MÉTODO 4: ACTUALIZAR UN CLIENTE
  // ========================================
  
  /**
   * Actualiza un cliente existente
   * 
   * @param id - ID del cliente a actualizar
   * @param cliente - Datos actualizados
   * @returns Observable<Cliente> → El cliente actualizado
   * 
   * Envía un PUT con los datos modificados
   */
  update(id: number, cliente: ClienteUpdateDto): Observable<string> {
    const url = `${this.apiUrl}/update/${id}`;
    return this.http.put<ApiResponse<void>>(url, cliente, this.httpOptions)
      .pipe(
        map(response => response.message),
        catchError(this.handleError)
      );
  }

  // ========================================
  // MÉTODO 5: ELIMINAR UN CLIENTE
  // ========================================
  
  /**
   * Elimina un cliente (o lo marca como inactivo, según tu backend)
   * 
   * @param id - ID del cliente a eliminar
   * @returns Observable<void> → No retorna datos, solo confirma la eliminación
   * 
   * Envía un DELETE al backend
   */
  delete(id: number): Observable<string> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete<ApiResponse<void>>(url, this.httpOptions)
      .pipe(
        map(response => response.message),
        catchError(this.handleError)
      );
  }

  // ========================================
  // MÉTODO DE UTILIDAD: MANEJO DE ERRORES
  // ========================================
  
  /**
   * Maneja los errores HTTP de forma centralizada
   * 
   * @param error - Error capturado por catchError
   * @returns Observable que emite un error
   * 
   * Puedes personalizar los mensajes según el código de estado HTTP:
   * - 400: Error de validación
   * - 404: No encontrado
   * - 500: Error del servidor
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos. Por favor verifica el formulario.';
          break;
        case 404:
          errorMessage = 'Cliente no encontrado.';
          break;
        case 409:
          errorMessage = 'Ya existe un cliente con ese documento.';
          break;
        case 500:
          errorMessage = 'Error en el servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en ClienteService:', error);
    return throwError(() => new Error(errorMessage));
  }

  // ========================================
  // MÉTODOS ADICIONALES (OPCIONALES)
  // ========================================
  
  /**
   * Busca clientes por término (nombre, documento, etc.)
   * Implementa esto si tu backend tiene búsqueda
   */
  search(term: string): Observable<Cliente[]> {
    const url = `${this.apiUrl}/search?q=${term}`;
    
    return this.http.get<Cliente[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene solo clientes activos
   * Útil para formularios de cotización (mostrar solo clientes válidos)
   */
  getActivos(): Observable<Cliente[]> {
    const url = `${this.apiUrl}/activos`;
    
    return this.http.get<Cliente[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }
}
