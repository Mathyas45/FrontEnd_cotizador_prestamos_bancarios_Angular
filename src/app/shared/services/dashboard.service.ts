import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * =====================================================
 * DASHBOARD SERVICE
 * =====================================================
 * 
 * Servicio para gestionar los datos del dashboard.
 * Separa la lógica de negocio del componente.
 */

/**
 * Interfaz para los datos del dashboard
 */
export interface DashboardData {
  totalClientes: number;
  totalSolicitudes: number;
  totalAprobados: number;
  totalRechazados: number;
  solicitudesPorMes: SolicitudMes[];
  aprobadosRechazadosPorMes: AprobadosRechazadosMes[];
}

/**
 * Interfaz para solicitudes por mes
 */
export interface SolicitudMes {
  mes: string;
  total: number;
}

/**
 * Interfaz para aprobados/rechazados por mes
 */
export interface AprobadosRechazadosMes {
  mes: string;
  aprobados: number;
  rechazados: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del dashboard desde el backend
   * @returns Observable con los datos del dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.API_URL}/dashboard`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener datos del dashboard:', error);
          return throwError(() => new Error('Error al cargar los datos del dashboard'));
        })
      );
  }

  /**
   * Calcula el porcentaje de aprobación
   * @param data Datos del dashboard
   * @returns Porcentaje de aprobación
   */
  calcularPorcentajeAprobacion(data: DashboardData): number {
    if (!data || data.totalSolicitudes === 0) {
      return 0;
    }
    return Math.round((data.totalAprobados / data.totalSolicitudes) * 100);
  }

  /**
   * Calcula el porcentaje de rechazo
   * @param data Datos del dashboard
   * @returns Porcentaje de rechazo
   */
  calcularPorcentajeRechazo(data: DashboardData): number {
    if (!data || data.totalSolicitudes === 0) {
      return 0;
    }
    return Math.round((data.totalRechazados / data.totalSolicitudes) * 100);
  }

  /**
   * Formatea el mes de YYYY-MM a formato legible (Mes Año)
   * @param mes Mes en formato YYYY-MM
   * @returns Mes formateado (Ej: "Ene 2025")
   */
  formatearMes(mes: string): string {
    const [year, month] = mes.split('-');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIndex = parseInt(month, 10) - 1;
    
    if (monthIndex < 0 || monthIndex > 11) {
      return mes; // Retornar el valor original si no es válido
    }
    
    return `${meses[monthIndex]} ${year}`;
  }
}
