import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// Exportación
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Servicios y modelos
import { SolicitudPrestamosService } from '../../../shared/services/solicitud-prestamos.service';
import { SolicitudPrestamo } from '../../../shared/interface/solicitud-prestamos.model';

// Toastr para notificaciones
import { ToastrService } from 'ngx-toastr';

// Componentes
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { SolicitudPrestamosFormComponent } from '../solicitud-prestamos-form/solicitud-prestamos-form.component';
import { ActionConfirmComponent } from '../../../shared/components/ui/action-confirm/action-confirm.component';

@Component({
  selector: 'app-solicitud-prestamos-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardComponent, 
    SolicitudPrestamosFormComponent,
    ActionConfirmComponent,
    TableModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [SolicitudPrestamosService],
  templateUrl: './solicitud-prestamos-list.component.html',
  styleUrls: ['./solicitud-prestamos-list.component.scss']
})
export class SolicitudPrestamosListComponent implements OnInit, OnDestroy {

  @ViewChild('SolicitudPrestamosFormComponent') solicitudPrestamosFormComponent!: SolicitudPrestamosFormComponent;
  @ViewChild('actionConfirm') actionConfirm!: ActionConfirmComponent;

  // Lista de solicitudes de préstamos
  solicitudPrestamos: SolicitudPrestamo[] = [];
  solicitudPrestamosFiltrados: SolicitudPrestamo[] = [];

  selectedSolicitudId: number | null = null;
  showModal: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  hasError: boolean = false;

  // Para manejar la destrucción del componente y evitar fugas de memoria
  private destroy$ = new Subject<void>();
  
  // Término de búsqueda
  searchTerm: string = '';
  
  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  /**
   * Angular INYECTA automáticamente las dependencias
   * como en Vue con provide/inject
   */
  constructor(
    private solicitudPrestamosService: SolicitudPrestamosService,
    private toastr: ToastrService,
  ) {}



  // ========================================
  // MÉTODO NGONINIT sirve para inicializar el componente cuando se carga
  // ========================================
  ngOnInit(): void {
    this.loadSolicitudPrestamos();
  }
  // ========================================
  // MÉTODO NGONDESTROY sirve para limpiar recursos cuando el componente se destruye
  // ========================================
  ngOnDestroy(): void {
    // Emitimos un valor para completar todas las suscripciones
    this.destroy$.next(); // Esto indica a todas las suscripciones que deben completarse
    this.destroy$.complete(); // Completamos el Subject para liberar recursos
  }
  // ========================================
  // MÉTODO CARGAR SOLICITUDES DE PRÉSTAMOS
  // ========================================
  loadSolicitudPrestamos(): void {
    this.isLoading = true;
    this.hasError = false;

    this.solicitudPrestamosService.getAll()
      .pipe(takeUntil(this.destroy$))//esto es para que la suscripción se cancele automáticamente cuando el componente se destruya, pipe es como un middleware que procesa los datos antes de llegar al suscriptor es dcir a la función que maneja la respuesta
      .subscribe({//esto es para manejar la respuesta de la petición http
        next: (data) => {
          this.solicitudPrestamos = data;//aqui asignamos los datos recibidos del backend al array de solicitudes de préstamos
          this.solicitudPrestamosFiltrados = data;//asignamos los datos al array filtrado también
          this.isLoading = false;
           // Notificación de éxito
          if (data.length === 0) {
            this.toastr.info('No hay solicitudes de préstamos disponibles.', 'Información');
          }        
        },
        error: (error) => {
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = error.message || 'Error al cargar las solicitudes de préstamos.';
          this.toastr.error(this.errorMessage, 'Error');
        }
      });
  }
  
  // ========================================
  // MÉTODO FILTRAR SOLICITUDES DE PRÉSTAMOS
  // ========================================
  filterSolicitudPrestamos(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Si no hay término, muestra todos
      this.solicitudPrestamosFiltrados = this.solicitudPrestamos;
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();

     // Filtrar por múltiples campos
    this.solicitudPrestamosFiltrados = this.solicitudPrestamos.filter(sp =>
      (sp.cliente && sp.cliente.nombreCompleto.toLowerCase().includes(term)) ||
      (sp.estado && sp.estado.toString().includes(term)) ||
      (sp.monto !== undefined && sp.monto.toString().includes(term))
    );
  }

  // ========================================
  // MÉTODO ABRIR MODAL PARA CREAR/EDITAR SOLICITUD DE PRÉSTAMO
  openModal(solicitudPrestamoId: number | null = null): void {
    this.selectedSolicitudId = solicitudPrestamoId;
    this.showModal = true;
  }
  // ========================================
  // MÉTODO CERRAR MODAL
  closeModal(): void {
    this.showModal = false;
    this.selectedSolicitudId = null;
  }

  // ========================================
  // MÉTODO PARA CONFIRMACIÓN Y ELIMINACIÓN
  // ========================================
  deleteSolicitud(nombre: string, id: number): void {
    this.actionConfirm.nombre = nombre;
    this.actionConfirm.id = id;
    this.actionConfirm.tipo = 'eliminar';
    this.actionConfirm.mensaje = `¿Estás seguro de que deseas eliminar la solicitud de préstamo de  <strong>${nombre}</strong>? Esta acción no se puede deshacer.`;
    this.actionConfirm.showConfirm();
  }

  // Este método se ejecuta cuando el usuario confirma desde el modal
  onConfirmAction(id: number | null): void {
    if (id) {
      this.solicitudPrestamosService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Solicitud eliminada correctamente', 'Éxito');
            this.loadSolicitudPrestamos();
          },
          error: (error) => {
            this.toastr.error(error.message, 'Error al eliminar');
            console.error('Error al eliminar solicitud:', error);
          }
        });
    }
  }

  openCreateModal(): void {
    this.selectedSolicitudId = null;
    this.showModal = true;
  }

  openEditModal(id: number): void {
    this.selectedSolicitudId = id;
    this.showModal = true;
  }

  onSolicitudSaved(): void {
    this.closeModal();
    this.loadSolicitudPrestamos();
  }

  getEstadoClass(estado: number): string {
    if (estado === 1) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }
/**
   * Envía el formulario llamando al método onSubmit del componente hijo
   */
  submitForm(): void {
    if (this.solicitudPrestamosFormComponent) {
      this.solicitudPrestamosFormComponent.onSubmit();
    }else {
      console.error('El componente del formulario no está disponible.');
    }
  }

  // ========================================
  // MÉTODOS DE EXPORTACIÓN
  // ========================================
  
  /**
   * Exportar a Excel
   */
  exportToExcel(): void {
    const data = this.solicitudPrestamosFiltrados.map(row => ({
      'Cliente': row.cliente.nombreCompleto,
      'Email': row.cliente.email,
      'Documento': row.cliente.documentoIdentidad,
      'Monto': row.montoFinanciar,
      'Plazo': row.plazoAnios + ' años',
      'Tasa': row.tasaInteres + '%',
      'Fecha': row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-PE') : '',
      'Estado': row.estado === 1 ? 'Activo' : 'Inactivo'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Solicitudes_Prestamos_${new Date().getTime()}.xlsx`);
    this.toastr.success('Excel exportado correctamente', 'Éxito');
  }

  /**
   * Exportar a PDF
   */
  exportToPDF(): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Solicitudes de Préstamos', 14, 22);
    
    const tableData = this.solicitudPrestamosFiltrados.map(row => [
      row.cliente.nombreCompleto,
      row.cliente.documentoIdentidad,
      'S/ ' + row.montoFinanciar,
      row.plazoAnios + ' años',
      row.tasaInteres + '%',
      row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-PE') : '',
      row.estado === 1 ? 'Activo' : 'Inactivo'
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Documento', 'Monto', 'Plazo', 'Tasa', 'Fecha', 'Estado']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: 30 }
    });

    doc.save(`Solicitudes_Prestamos_${new Date().getTime()}.pdf`);
    this.toastr.success('PDF exportado correctamente', 'Éxito');
  }

}