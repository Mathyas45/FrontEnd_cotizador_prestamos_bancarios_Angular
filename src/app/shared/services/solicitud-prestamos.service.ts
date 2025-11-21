import { Injectable } from "@angular/core"; //esto es para hacer un servicio inyectable es decir que se puede usar en cualquier parte de la app
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http"; //esto es para hacer peticiones http
import { Observable, throwError } from "rxjs"; //esto es para manejar las respuestas de las peticiones http
import { catchError, map } from "rxjs/operators"; //esto es para manejar los errores y transformar las respuestas

// Importamos los modelos que creamos
import {
  SolicitudPrestamo,
  SolicitudPrestamoCreateDto,
  SolicitudPrestamoUpdateDto,
} from "../interface/solicitud-prestamos.model";
import { solicitudPrestamos } from "../../components/solicitud-prestamos/solicitud-prestamos.routes";

@Injectable({
  providedIn: "root",
})
export class SolicitudPrestamosService {
  // ========================================
  // CONFIGURACIÓN DEL BACKEND
  // ========================================

  private apiUrl = "http://localhost:8080/api/solicitudesPrestamo";

  private httpOptions = {
    //esto es para configurar los headers de las peticiones http es decir que tipo de datos vamos a enviar y recibir
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };

  constructor(private http: HttpClient) {} //esto es para inyectar el servicio de HttpClient en nuestro servicio

  // ========================================
  // MÉTODO 1: OBTENER TODAS LAS SOLICITUDES DE PRÉSTAMOS
  // ========================================

  getAll(): Observable<SolicitudPrestamo[]> {
    return this.http.get<SolicitudPrestamo[]>(this.apiUrl).pipe(
      map((response) => {
        console.log("Respuesta del backend:", response);
        return response.map((solicitudPrestamo) => ({
          ...solicitudPrestamo,
          createdAt: solicitudPrestamo.createdAt
            ? new Date(solicitudPrestamo.createdAt)
            : undefined, //si createdAt tiene valor lo convierte a Date si no lo deja como undefined
        }));
      }),
      catchError((error) => {
        return throwError(
          () => new Error(`Error ${error.status}: ${error.message}`)
        );
      })
    );
  }

  getById(id: number): Observable<SolicitudPrestamo> {
    //esta parte <SolicitudPrestamo> es para indicar el tipo de dato que esperamos recibir
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<SolicitudPrestamo>(url).pipe(
      map((solicitudPrestamo) => ({
        ...solicitudPrestamo,
        createdAt: solicitudPrestamo.createdAt
          ? new Date(solicitudPrestamo.createdAt)
          : undefined,
      })),
      catchError((error) => {
        return throwError(
          () => new Error(`Error ${error.status}: ${error.message}`)
        );
      })
    );
  }

  create(solicitud: SolicitudPrestamoCreateDto): Observable<SolicitudPrestamo> {
    return this.http
      .post<SolicitudPrestamo>(
        `${this.apiUrl}/register`,
        solicitud,
        this.httpOptions
      )
      .pipe(
        catchError((error) => {
          return throwError(
            () => new Error(`Error ${error.status}: ${error.message}`)
          );
        })
      );
  }

  update(
    id: number,
    solicitud: SolicitudPrestamoUpdateDto
  ): Observable<SolicitudPrestamo> {
    const url = `${this.apiUrl}/update/${id}`;
    return this.http
      .put<SolicitudPrestamo>(url, solicitud, this.httpOptions)
      .pipe(
        catchError((error) => {
          return throwError(
            () => new Error(`Error ${error.status}: ${error.message}`)
          );
        })
      );
  }
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      catchError((error) => {
        return throwError(
          () => new Error(`Error ${error.status}: ${error.message}`)
        );
      })
    );
  }
}
