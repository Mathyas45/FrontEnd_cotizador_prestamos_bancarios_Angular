/**
 * ============================================
 * COMPONENTE: FORMULARIO DE CLIENTE
 * ============================================
 * 
 * Este componente maneja la CREACIÓN y EDICIÓN de clientes.
 * Usa un único formulario que cambia según el modo:
 * - Modo CREATE: /clientes/nuevo
 * - Modo EDIT: /clientes/editar/:id
 * 
 * CARACTERÍSTICAS:
 * - Formulario reactivo (ReactiveFormsModule)
 * - Validaciones en tiempo real
 * - Mensajes de error personalizados
 * - Carga de datos para edición
 * - Notificaciones de éxito/error
 * 
 * CONCEPTOS CLAVE:
 * - FormBuilder: Construye formularios fácilmente
 * - Validators: Validaciones incorporadas de Angular
 * - ActivatedRoute: Obtiene parámetros de la URL
 */

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Servicios y modelos
import { ClienteService } from '../../../shared/services/cliente.service';
import { Cliente, ClienteCreateDto, ClienteUpdateDto } from '../../../shared/interface/cliente.model';

// Notificaciones
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // Para formularios reactivos
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss'
})
export class ClienteFormComponent implements OnInit, OnDestroy, OnChanges {

  // ========================================
  // INPUTS Y OUTPUTS (para comunicación con el componente padre)
  // ========================================
  
  /**
   * ID del cliente a editar (null = crear nuevo)
   */
  @Input() clienteId: number | null = null;

  /**
   * Indica si el formulario está en un modal
   */
  @Input() isModal: boolean = false;

  /**
   * Controla la visibilidad del modal
   */
  @Input() isVisible: boolean = false;

  /**
   * Evento que se emite cuando se guarda exitosamente
   */
  @Output() onSaved = new EventEmitter<Cliente>();

  /**
   * Evento que se emite cuando se cancela
   */
  @Output() onCancelEvent = new EventEmitter<void>();

  // ========================================
  // PROPIEDADES DEL COMPONENTE
  // ========================================
  
  /**
   * FormGroup: Maneja todo el formulario
   * Similar a reactive forms en Vue con VeeValidate
   */
  clienteForm!: FormGroup;

  /**
   * Modo del formulario: true = crear, false = editar
   */
  isCreateMode: boolean = true;

  /**
   * Estado de carga (al enviar o cargar datos)
   */
  isLoading: boolean = false;

  /**
   * Indica si el formulario se está enviando
   */
  isSubmitting: boolean = false;

  /**
   * Tipos de documento disponibles
   */
  tiposDocumento = [
    { value: 'DNI', label: 'DNI' },
    { value: 'RUC', label: 'RUC' },
    { value: 'CE', label: 'Carnet de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  /**
   * Estados disponibles (regEstado)
   */
  estados = [
    { value: 1, label: 'Activo' },
    { value: 0, label: 'Inactivo' }
  ];

  /**
   * Subject para cancelar suscripciones
   */
  private destroy$ = new Subject<void>();

  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  /**
   * @param fb - FormBuilder para construir el formulario
   * @param clienteService - Servicio de clientes
   * @param toastr - Para notificaciones
   */
  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) { }

  // ========================================
  // CICLO DE VIDA: ngOnInit
  // ========================================
  
  ngOnInit(): void {
    // 1. Crear el formulario
    this.buildForm();

    // 2. Si hay clienteId, cargar datos
    if (this.clienteId) {
      this.isCreateMode = false;
      this.loadClienteData(this.clienteId);
    }
  }

  // ========================================
  // CICLO DE VIDA: ngOnChanges
  // ========================================
  
  /**
   * Se ejecuta cuando cambian los @Input
   * Detecta cambios en clienteId para recargar datos
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clienteId'] && !changes['clienteId'].firstChange) {
      if (this.clienteId) {
        this.isCreateMode = false;
        this.loadClienteData(this.clienteId);
      } else {
        this.isCreateMode = true;
        if (this.clienteForm) {
          this.resetForm();
        }
      }
    }
  }

  // ========================================
  // CICLO DE VIDA: ngOnDestroy
  // ========================================
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // MÉTODO 1: CONSTRUIR EL FORMULARIO
  // ========================================
  
  /**
   * Construye el formulario con validaciones
   * 
   * VALIDACIONES:
   * - Validators.required → Campo obligatorio
   * - Validators.email → Formato de email válido
   * - Validators.minLength(n) → Mínimo n caracteres
   * - Validators.maxLength(n) → Máximo n caracteres
   * - Validators.pattern(regex) → Expresión regular
   */
  buildForm(): void {
    this.clienteForm = this.fb.group({
      // Nombre completo
      nombreCompleto: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]],

      // Documento de identidad
      documentoIdentidad: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20)
      ]],

      // Email
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],

      // Teléfono (opcional)
      telefono: ['', [
        Validators.maxLength(20),
        Validators.pattern(/^[0-9]{7,20}$/)
      ]],

      // Ingreso mensual (opcional)
      ingresoMensual: [0, [
        Validators.min(0)
      ]],

      // Estado (1 = activo, 0 = inactivo)
      regEstado: [1, Validators.required]
    });
  }

  // ========================================
  // MÉTODO 2: CARGAR DATOS PARA EDICIÓN
  // ========================================
  
  /**
   * Carga los datos del cliente desde el backend
   * y los coloca en el formulario
   * 
   * @param id - ID del cliente a cargar
   */
  loadClienteData(id: number): void {
    this.isLoading = true;

    this.clienteService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cliente) => {
          // Llenar el formulario con los datos del cliente
          this.clienteForm.patchValue({
            nombreCompleto: cliente.nombreCompleto,
            documentoIdentidad: cliente.documentoIdentidad,
            email: cliente.email,
            telefono: cliente.telefono || '',
            ingresoMensual: cliente.ingresoMensual || 0,
            regEstado: cliente.regEstado
          });

          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('No se pudo cargar el cliente', 'Error');
          console.error('Error al cargar cliente:', error);
          
          // Emitir evento de cancelación
          this.onCancelEvent.emit();
        }
      });
  }

  // ========================================
  // MÉTODO 3: ENVIAR FORMULARIO
  // ========================================
  
  /**
   * Maneja el envío del formulario
   * Crea o actualiza según el modo
   */
  onSubmit(): void {
    // Validar el formulario
    if (this.clienteForm.invalid) {
      // Marcar todos los campos como "touched" para mostrar errores
      Object.keys(this.clienteForm.controls).forEach(key => {
        this.clienteForm.get(key)?.markAsTouched();
      });

      this.toastr.warning('Por favor completa todos los campos correctamente', 'Formulario incompleto');
      return;
    }

    // Ejecutar según el modo
    if (this.isCreateMode) {
      this.createCliente();
    } else {
      this.updateCliente();
    }
  }

  // ========================================
  // MÉTODO 4: CREAR CLIENTE
  // ========================================
  
  /**
   * Crea un nuevo cliente
   */
  createCliente(): void {
    this.isSubmitting = true;

    // Obtener los datos del formulario
    const clienteData: ClienteCreateDto = this.clienteForm.value;

    this.clienteService.create(clienteData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cliente) => {
          this.isSubmitting = false;
          
          // Notificación de éxito
          this.toastr.success('Cliente creado correctamente', 'Éxito');

          // Emitir evento de guardado exitoso
          this.onSaved.emit(cliente);
          
          // Resetear formulario
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.toastr.error(error.message, 'Error al crear cliente');
          console.error('Error al crear cliente:', error);
        }
      });
  }

  // ========================================
  // MÉTODO 5: ACTUALIZAR CLIENTE
  // ========================================
  
  /**
   * Actualiza un cliente existente
   */
  updateCliente(): void {
    if (!this.clienteId) {
      this.toastr.error('ID de cliente no válido', 'Error');
      return;
    }

    this.isSubmitting = true;

    // Obtener los datos del formulario
    const clienteData: ClienteUpdateDto = {
      id: this.clienteId,
      ...this.clienteForm.value
    };

    this.clienteService.update(this.clienteId, clienteData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cliente) => {
          this.isSubmitting = false;
          
          // Notificación de éxito
          this.toastr.success('Cliente actualizado correctamente', 'Éxito');

          // Emitir evento de guardado exitoso
          this.onSaved.emit(cliente);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.toastr.error(error.message, 'Error al actualizar cliente');
          console.error('Error al actualizar cliente:', error);
        }
      });
  }

  // ========================================
  // MÉTODO 6: CANCELAR
  // ========================================
  
  /**
   * Cancela la operación
   */
  cancel(): void {
    // Verificar si hay cambios sin guardar
    if (this.clienteForm.dirty && !this.isSubmitting) {
      Swal.fire({
        title: '¿Descartar cambios?',
        text: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.onCancelEvent.emit();
        }
      });
    } else {
      // Si no hay cambios, cancelar directamente
      this.onCancelEvent.emit();
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD PARA VALIDACIONES
  // ========================================
  
  /**
   * Verifica si un campo es inválido y ha sido tocado
   * Útil para mostrar mensajes de error
   * 
   * @param fieldName - Nombre del campo
   * @returns true si es inválido y tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error de un campo
   * 
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error o null
   */
  getErrorMessage(fieldName: string): string | null {
    const field = this.clienteForm.get(fieldName);
    
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido';
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
    }

    return null;
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.clienteForm.reset({
      ingresoMensual: 0,
      regEstado: 1
    });
  }
}
