/**
 * ============================================
 * COMPONENTE: LISTADO DE CLIENTES
 * ============================================
 * 
 * Este componente muestra una tabla con todos los clientes.
 * Permite:
 * - Ver todos los clientes
 * - Buscar/filtrar clientes
 * - Navegar a crear nuevo cliente
 * - Editar un cliente existente
 * - Eliminar un cliente (con confirmación)
 * 
 * CICLO DE VIDA (similar a Vue):
 * 1. constructor() → Se ejecuta al crear el componente
 * 2. ngOnInit() → Equivalente a onMounted() en Vue
 * 3. ngOnDestroy() → Equivalente a onUnmounted() en Vue
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';// RxJS para manejo de streams y cancelación

// Servicios y modelos
import { ClienteService } from '../../../shared/services/cliente.service';
import { Cliente } from '../../../shared/interface/cliente.model';

// SweetAlert para confirmaciones
import Swal from 'sweetalert2';

// Toastr para notificaciones
import { ToastrService } from 'ngx-toastr';

// Componentes de la plantilla Cuba
import { CardComponent } from '../../../shared/components/ui/card/card.component';

// Componente del formulario (para usar en modal)
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';

/**
 * @Component: Decorador que define un componente Angular
 * - selector: Nombre del tag HTML para usar este componente
 * - imports: Módulos y componentes que usa (en Angular standalone)
 * - templateUrl: Ruta al archivo HTML
 * - styleUrl: Ruta al archivo SCSS
 */
@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,           // Directivas básicas: *ngIf, *ngFor, pipes, etc.
    FormsModule,            // Para ngModel (búsqueda)
    CardComponent,          // Componente de tarjeta de la plantilla
    ClienteFormComponent    // Formulario en modal
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss'
})
export class ClienteListComponent implements OnInit, OnDestroy {

  // ========================================
  // VIEWCHILD - REFERENCIA AL FORMULARIO
  // ========================================
  
  /**
   * Referencia al componente hijo ClienteFormComponent
   * Permite acceder a sus métodos y propiedades desde el padre
   */
  @ViewChild('clienteFormComponent') clienteFormComponent!: ClienteFormComponent;

  // ========================================
  // PROPIEDADES DEL COMPONENTE
  // ========================================
  
  /**
   * Array que contiene todos los clientes
   * Similar a ref([]) en Vue
   */
  clientes: Cliente[] = [];

  /**
   * Array filtrado para la búsqueda
   * Permite buscar sin modificar el array original
   */
  clientesFiltrados: Cliente[] = [];//esto nos sirve para tener una copia del array original y poder filtrar sin perder los datos originales

  /**
   * Término de búsqueda
   * Vinculado al input con [(ngModel)]
   */
  searchTerm: string = '';

  /**
   * Estado de carga
   * Se muestra un spinner mientras carga
   */
  isLoading: boolean = false;

  /**
   * Indica si hubo un error al cargar
   */
  hasError: boolean = false;

  /**
   * Mensaje de error personalizado
   */
  errorMessage: string = '';

  /**
   * Controla la visibilidad del modal
   */
  showModal: boolean = false;

  /**
   * ID del cliente seleccionado para editar (null = crear nuevo)
   */
  selectedClienteId: number | null = null;

  /**
   * Subject para cancelar suscripciones
   * Previene memory leaks (fugas de memoria)
   * Similar a onUnmounted en Vue
   */
  private destroy$ = new Subject<void>();

  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  /**
   * Angular INYECTA automáticamente las dependencias
   * 
   * @param clienteService - Servicio para manejar clientes
   * @param toastr - Para mostrar notificaciones
   */
  constructor(
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) { }

  // ========================================
  // CICLO DE VIDA: ngOnInit
  // ========================================
  
  /**
   * Se ejecuta al montar el componente
   * Equivalente a onMounted() en Vue
   * 
   * Aquí cargamos los datos iniciales
   */
  ngOnInit(): void {
    this.loadClientes();
  }

  // ========================================
  // CICLO DE VIDA: ngOnDestroy
  // ========================================
  
  /**
   * Se ejecuta al destruir el componente
   * Equivalente a onUnmounted() en Vue nos sirve para limpiar recursos
   * 
   * Cancela todas las suscripciones para evitar memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // MÉTODO 1: CARGAR CLIENTES
  // ========================================
  
  /**
   * Carga todos los clientes desde el backend
   * 
   * FLUJO:
   * 1. Activa el loading
   * 2. Llama al servicio
   * 3. Guarda los datos en el array
   * 4. Desactiva el loading
   */
  loadClientes(): void {
    this.isLoading = true;
    this.hasError = false;

    // Llamada al servicio
    // .pipe(takeUntil()) cancela la suscripción al destruir el componente
    this.clienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        // next: Se ejecuta cuando llegan los datos
        next: (data) => {
          this.clientes = data;
          this.clientesFiltrados = data; // Inicialmente muestra todos
          this.isLoading = false;
          
          // Notificación de éxito
          if (data.length === 0) {
            this.toastr.info('No hay clientes registrados', 'Info');
          }
        },
        // error: Se ejecuta si hay un error
        error: (error) => {
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = error.message;
          
          // Notificación de error
          this.toastr.error('Error al cargar los clientes', 'Error');
          console.error('Error al cargar clientes:', error);
        }
      });
  }

  // ========================================
  // MÉTODO 2: BUSCAR/FILTRAR CLIENTES
  // ========================================
  
  /**
   * Filtra los clientes según el término de búsqueda
   * Busca en: nombreCompleto, documento, email
   * 
   * Se ejecuta automáticamente con (input) en el HTML
   */
  filterClientes(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Si no hay término, muestra todos
      this.clientesFiltrados = this.clientes;
      return;
    }

    // Convertir a minúsculas para búsqueda case-insensitive
    const term = this.searchTerm.toLowerCase().trim();

    // Filtrar por múltiples campos
    this.clientesFiltrados = this.clientes.filter(cliente => {
      const nombreCompleto = cliente.nombreCompleto?.toLowerCase() || '';
      const documento = cliente.documentoIdentidad?.toLowerCase() || '';
      const email = cliente.email?.toLowerCase() || '';

      return nombreCompleto.includes(term) ||
             documento.includes(term) ||
             email.includes(term);
    });
  }

  // ========================================
  // MÉTODO 3: ABRIR MODAL PARA CREAR CLIENTE
  // ========================================
  
  /**
   * Abre el modal para crear un nuevo cliente
   */
  openCreateModal(): void {
    this.selectedClienteId = null;
    this.showModal = true;
  }

  // ========================================
  // MÉTODO 4: ABRIR MODAL PARA EDITAR CLIENTE
  // ========================================
  
  /**
   * Abre el modal para editar un cliente existente
   * 
   * @param id - ID del cliente a editar
   */
  openEditModal(id: number): void {
    this.selectedClienteId = id;
    this.showModal = true;
  }

  // ========================================
  // MÉTODO 5: CERRAR MODAL
  // ========================================
  
  /**
   * Cierra el modal del formulario
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedClienteId = null;
  }

  // ========================================
  // MÉTODO 6: MANEJAR GUARDADO EXITOSO
  // ========================================
  
  /**
   * Se ejecuta cuando el formulario se guarda exitosamente
   * Recarga la lista y cierra el modal
   */
  onClienteSaved(): void {
    this.closeModal();
    this.loadClientes();
  }

  // ========================================
  // MÉTODO 7: ELIMINAR CLIENTE
  // ========================================
  
  /**
   * Elimina un cliente (con confirmación)
   * 
   * FLUJO:
   * 1. Muestra confirmación con SweetAlert
   * 2. Si confirma, llama al servicio
   * 3. Actualiza la lista
   * 4. Muestra notificación
   * 
   * @param cliente - Cliente a eliminar
   */
  deleteCliente(cliente: Cliente): void {
    // Confirmación con SweetAlert2
    Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Deseas eliminar al cliente <strong>${cliente.nombreCompleto}</strong>?<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      // Si el usuario confirma
      if (result.isConfirmed && cliente.id) {
        // Llamada al servicio para eliminar
        this.clienteService.delete(cliente.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              // Eliminar del array local (sin recargar desde el backend)
              this.clientes = this.clientes.filter(c => c.id !== cliente.id);
              this.clientesFiltrados = this.clientesFiltrados.filter(c => c.id !== cliente.id);

              // Notificación de éxito
              this.toastr.success('Cliente eliminado correctamente', 'Éxito');
              
              // SweetAlert de confirmación
              Swal.fire(
                'Eliminado',
                'El cliente ha sido eliminado.',
                'success'
              );
            },
            error: (error) => {
              // Notificación de error
              this.toastr.error(error.message, 'Error al eliminar');
              console.error('Error al eliminar cliente:', error);
            }
          });
      }
    });
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================


  /**
   * Envía el formulario llamando al método onSubmit del componente hijo
   */
  submitForm(): void {
    if (this.clienteFormComponent) {
      this.clienteFormComponent.onSubmit();
    }
  }

  /**
   * Verifica si el formulario es inválido
   */
  isFormInvalid(): boolean {
    return this.clienteFormComponent?.clienteForm?.invalid || false;
  }

  /**
   * Verifica si el formulario está enviando datos
   */
  isFormSubmitting(): boolean {
    return this.clienteFormComponent?.isSubmitting || false;
  }

  /**
   * Obtiene la clase CSS según el estado del cliente
   * Útil para mostrar badges de colores
   * 
   * @param estado - Estado del cliente (1=Activo, 0=Inactivo)
   * @returns Clase CSS de Tailwind
   */
  getEstadoClass(estado: number): string {
    if (estado === 1) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Formatea el crédito disponible como moneda
   * 
   * @param monto - Monto a formatear
   * @returns String formateado como S/ 1,000.00
   */
  formatCurrency(monto?: number): string {
    if (!monto) return 'S/ 0.00';
    return `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formatea la fecha
   * 
   * @param fecha - Fecha a formatear
   * @returns String formateado como dd/mm/yyyy
   */
  formatDate(fecha?: Date | string): string {
    if (!fecha) return '-';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-PE');
  }
}
