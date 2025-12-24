import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardData } from '../../shared/services/dashboard.service';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexLegend, ApexStroke, ApexGrid, ApexTooltip } from 'ng-apexcharts';

/**
 * =====================================================
 * DASHBOARD COMPONENT
 * =====================================================
 * 
 * Dashboard principal que muestra estadísticas desde el backend.
 * Utiliza DashboardService para separar la lógica de negocio.
 * Incluye gráficos modernos con ApexCharts.
 */

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  legend?: ApexLegend;
  stroke?: ApexStroke;
  grid?: ApexGrid;
  colors?: string[];
  tooltip?: ApexTooltip;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  @ViewChild("chart") chart!: ChartComponent;
  
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  // Configuración de gráficos
  solicitudesPorMesChart!: Partial<ChartOptions>;
  aprobadosRechazadosChart!: Partial<ChartOptions>;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga los datos del dashboard desde el backend
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardData()
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.loading = false;
          this.initCharts();
        },
        error: (err) => {
          console.error('Error al cargar dashboard:', err);
          this.error = err.message || 'Error al cargar los datos del dashboard';
          this.loading = false;
        }
      });
  }

  /**
   * Inicializa los gráficos con los datos cargados
   */
  private initCharts(): void {
    if (!this.dashboardData) return;

    // Gráfico de Solicitudes por Mes (Área)
    const meses = this.dashboardData.solicitudesPorMes.map(item => this.formatMes(item.mes));
    const totales = this.dashboardData.solicitudesPorMes.map(item => item.total);

    this.solicitudesPorMesChart = {
      series: [{
        name: 'Solicitudes',
        data: totales
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#0d6efd'],
      xaxis: {
        categories: meses,
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      grid: {
        borderColor: '#e7e7e7',
        strokeDashArray: 5
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (value) => `${value} solicitudes`
        }
      }
    };

    // Gráfico de Aprobados vs Rechazados (Barras)
    const aprobados = this.dashboardData.aprobadosRechazadosPorMes.map(item => item.aprobados);
    const rechazados = this.dashboardData.aprobadosRechazadosPorMes.map(item => item.rechazados);
    const mesesAR = this.dashboardData.aprobadosRechazadosPorMes.map(item => this.formatMes(item.mes));

    this.aprobadosRechazadosChart = {
      series: [
        {
          name: 'Aprobados',
          data: aprobados
        },
        {
          name: 'Rechazados',
          data: rechazados
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      colors: ['#198754', '#dc3545'],
      xaxis: {
        categories: mesesAR,
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      grid: {
        borderColor: '#e7e7e7',
        strokeDashArray: 5
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (value) => `${value} solicitudes`
        }
      }
    };
  }

  /**
   * Calcula el porcentaje de aprobación
   */
  get porcentajeAprobacion(): number {
    return this.dashboardData 
      ? this.dashboardService.calcularPorcentajeAprobacion(this.dashboardData)
      : 0;
  }

  /**
   * Calcula el porcentaje de rechazo
   */
  get porcentajeRechazo(): number {
    return this.dashboardData 
      ? this.dashboardService.calcularPorcentajeRechazo(this.dashboardData)
      : 0;
  }

  /**
   * Formatea el nombre del mes (YYYY-MM a formato legible)
   */
  formatMes(mes: string): string {
    return this.dashboardService.formatearMes(mes);
  }
}
