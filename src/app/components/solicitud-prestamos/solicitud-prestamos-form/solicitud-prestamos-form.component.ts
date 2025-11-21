import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { SolicitudPrestamo, SolicitudPrestamoCreateDto, SolicitudPrestamoUpdateDto } from "../../../shared/interface/solicitud-prestamos.model";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs"; //esto es para manejar la destrucción de suscripciones
import { SolicitudPrestamosService } from "../../../shared/services/solicitud-prestamos.service";
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse } from "@angular/common/http";
import { FormValidationService } from '../../../shared/components/ui/form-validation/FormValidationService';
import Swal from "sweetalert2";
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../shared/interface/cliente.model';
import { ClienteService } from '../../../shared/services/cliente.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: "app-solicitudPrestamos-form", //esto es para usar el componente en el html
  standalone: true, // Agregado para indicar que es un componente independiente
  imports: [
    CommonModule,
    ReactiveFormsModule, // Para formularios reactivos
    FormsModule, // Para ngModel en búsqueda es decir formularios template-driven que son más simples sirve para casos sencillos
    CurrencyFormatPipe// Para formatear moneda
  ],
  templateUrl: "./solicitud-prestamos-form.component.html",
  styleUrls: ["./solicitud-prestamos-form.component.scss"], // Corregido a styleUrls
})
export class SolicitudPrestamosFormComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() solicitudId: number | null = null; //esto es para recibir el id de la solicitud de prestamo que se va a editar
  @Input() isModal: boolean = false; // Indica si el formulario se muestra en un modal
  @Input() isVisible: boolean = false;
  @Output() onSaved = new EventEmitter<SolicitudPrestamo>(); //esto es para emitir un evento cuando se guarda la solicitud de prestamo
  /**
   * Evento que se emite cuando se cancela
   */
  @Output() onCancelEvent = new EventEmitter<void>();

  solicitudPrestamoForm!: FormGroup;

  isCreateMode: boolean = true; // Indica si el formulario está en modo creación o edición

  isLoading: boolean = false; // Indica si el formulario está en estado de carga

  isSubmitting: boolean = false; //Indica si el formulario se está enviando

  clientes: Cliente[] = []; // Lista de clientes
  filteredClientes: Cliente[] = []; // Clientes filtrados
  searchTerm: string = ''; // Término de búsqueda
  selectedClienteNombre: string = ''; // Nombre del cliente seleccionado
  
  // Para el formato visual del monto
  montoDisplayValue: string = ''; // Valor formateado para mostrar
  cuotaInicialCalculada: number = 0; // Cuota inicial calculada

  private destroy$ = new Subject<void>(); //esto es para manejar la destrucción de suscripciones


  constructor(
    private fb: FormBuilder,
    private solicitudPrestamosService: SolicitudPrestamosService,
    private toastr: ToastrService,
    private formValidationService: FormValidationService, // Inyectar el servicio de validación de formularios
    private clienteService: ClienteService // Servicio de clientes
  ) {}

  ngOnInit(): void {
    // 1. Crear el formulario
    this.buildForm();

    // 2. Cargar clientes
    this.loadClientes();

    // 3. Si hay un ID, cargar los datos para edición
    if (this.solicitudId) {
      this.isCreateMode = false;
      this.loadSolicitudPrestamo(this.solicitudId);
    }
  }

  /**
   * Se ejecuta cuando cambian los @Input
   * Detecta cambios en clienteId para recargar datos
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["solicitudId"] && !changes["solicitudId"].firstChange) {
      if (this.solicitudId) {
        this.isCreateMode = false;
        this.loadSolicitudPrestamo(this.solicitudId);
      } else {
        this.isCreateMode = true;
        if (this.solicitudPrestamoForm) {
          this.resetForm();
        }
      }
    }
  }

  ngOnDestroy(): void {
    // Método obligatorio de OnDestroy sirve para limpiar recursos cuando el componente se destruye
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(): void {// Crear el formulario con validaciones
    this.solicitudPrestamoForm = this.fb.group({
      monto: ["", [Validators.required, Validators.min(1)]],
      porcentajeCuotaInicial: [
        "",
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      plazoAnios: ["", [Validators.required, Validators.min(1)]],
      clienteId: ["", [Validators.required, Validators.min(1)]],
    });
  }

  loadSolicitudPrestamo(id: number): void {
    this.isLoading = true;

    this.solicitudPrestamosService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (solicitudPrestamo: SolicitudPrestamo) => {
          if (solicitudPrestamo) {
            console.log('cliente seleccionado:', solicitudPrestamo.cliente.id);
            
            // Asignar valores al formulario
            const montoValue = Number(solicitudPrestamo.monto) || 0;
            this.solicitudPrestamoForm.patchValue({
              monto: montoValue,
              porcentajeCuotaInicial: solicitudPrestamo.porcentajeCuotaInicial || 0,
              plazoAnios: solicitudPrestamo.plazoAnios || 0,
              clienteId: solicitudPrestamo.cliente?.id || null,
            });
            
            // Formatear el monto para visualización
            this.montoDisplayValue = montoValue.toLocaleString('en-US');
            
            // Calcular la cuota inicial
            this.calcularCuotaInicial();

            // Mostrar el nombre del cliente seleccionado
            if (solicitudPrestamo.cliente) {
              this.selectedClienteNombre = `${solicitudPrestamo.cliente.nombreCompleto} - ${solicitudPrestamo.cliente.documentoIdentidad}`;
            }
          } else {
            this.toastr.warning(
              "No se encontraron datos para la solicitud.",
              "Advertencia"
            );
          }
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.toastr.error(
            "Error al cargar la solicitud de préstamo: " + error.message,
            "Error"
          );
        },
      });
  }

  onSubmit(): void {
    if (this.solicitudPrestamoForm.invalid) {
      this.toastr.error(
        "Por favor, corrige los errores en el formulario.",
      );
      return;
    }
  
    // Convertir valores a números antes de enviar
    const montoControl = this.solicitudPrestamoForm.get('monto');
    const porcentajeControl = this.solicitudPrestamoForm.get('porcentajeCuotaInicial');
    const plazoControl = this.solicitudPrestamoForm.get('plazoAnios');
    
    if (montoControl) {
      const montoValue = parseFloat(montoControl.value) || 0;
      console.log('Monto a enviar:', montoValue);
      montoControl.setValue(montoValue);
    }
    
    if (porcentajeControl) {
      porcentajeControl.setValue(parseFloat(porcentajeControl.value) || 0);
    }
    
    if (plazoControl) {
      plazoControl.setValue(parseInt(plazoControl.value) || 0);
    }
    
    // Ejecutar según el modo
    if (this.isCreateMode) {
      this.crearSolicitudPrestamo();
    } else {
      // Lógica para actualizar una solicitud existente
      this.actualizarSolicitudPrestamo();
    } 
  }

  crearSolicitudPrestamo(): void {
    this.isSubmitting = true;
    const nuevaSolicitud : SolicitudPrestamoCreateDto = this.solicitudPrestamoForm.value;

    this.solicitudPrestamosService.create(nuevaSolicitud)
      .pipe(takeUntil(this.destroy$))//esto es para manejar la destrucción de suscripciones, pipe es como un middleware que procesa los datos antes de llegar al suscriptor es dcir a la función que maneja la respuesta
      .subscribe({
        next: (solicitudPrestamo) => {
          this.toastr.success('Solicitud creada exitosamente.', 'Éxito');
          this.onSaved.emit(solicitudPrestamo);
          this.isSubmitting = false;
           // Resetear formulario
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error('Error al crear la solicitud: ' + error.message, 'Error');
          this.isSubmitting = false;
        }
      });
  }

  actualizarSolicitudPrestamo(): void {
    this.isSubmitting = true;
    const solicitudActualizada : SolicitudPrestamoUpdateDto = this.solicitudPrestamoForm.value;

    if (this.solicitudId) {
      this.solicitudPrestamosService.update(this.solicitudId, solicitudActualizada)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (solicitudPrestamo) => {
            this.toastr.success('Solicitud actualizada exitosamente.', 'Éxito');
            this.onSaved.emit(solicitudPrestamo);
            this.isSubmitting = false;
          },
          error: (error: HttpErrorResponse) => {
            this.toastr.error('Error al actualizar la solicitud: ' + error.message, 'Error');
            this.isSubmitting = false;
          }
        });
    }
  }
  // esto es para cancelar el formulario con confirmación si hay cambios
  cancel(): void {
    if (this.solicitudPrestamoForm.dirty && !this.isSubmitting) {
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
  // Método para verificar si un campo es inválido y ha sido tocado o modificado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.solicitudPrestamoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


  // Método para obtener el mensaje de error de un campo
  getErrorMessage(fieldName: string): string | null {
    const field = this.solicitudPrestamoForm.get(fieldName);
    return this.formValidationService.getErrorMessage(field); // Usar el servicio
  }


  resetForm(): void {
    this.solicitudPrestamoForm.reset();
    this.montoDisplayValue = '';
    this.cuotaInicialCalculada = 0;
    this.selectedClienteNombre = '';
    this.searchTerm = '';
  }

  loadClientes(): void {
    this.clienteService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clientes) => {
          console.log('Clientes recibidos del backend:', clientes);
          this.clientes = clientes;
          this.filteredClientes = clientes;
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error('Error al cargar los clientes', 'Error');
        }
      });
  }

  // Filtrar clientes mientras se escribe
  onSearchCliente(): void {
    if (!this.searchTerm) {
      this.filteredClientes = this.clientes;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClientes = this.clientes.filter(c =>
        c.nombreCompleto.toLowerCase().includes(term) ||
        c.documentoIdentidad.toLowerCase().includes(term)
      );
    }
  }

  // Seleccionar un cliente
  selectCliente(cliente: Cliente): void {
    this.solicitudPrestamoForm.patchValue({ clienteId: cliente.id });//esto asigna el id del cliente seleccionado al formulario, patchValue es para actualizar solo un campo del formulario es decir para no sobreescribir todo el formulario
    this.selectedClienteNombre = `${cliente.nombreCompleto} - ${cliente.documentoIdentidad}`;//esto muestra el nombre del cliente seleccionado
    this.searchTerm = '';
    this.filteredClientes = [];
  }


  //calcular el monto de la cuota inicial sera decimal
  calcularCuotaInicial(): number {
    const monto = parseFloat(this.solicitudPrestamoForm.get('monto')?.value) || 0;
    const porcentajeCuotaInicial = parseFloat(this.solicitudPrestamoForm.get('porcentajeCuotaInicial')?.value) / 100 || 0;
    this.cuotaInicialCalculada = monto * porcentajeCuotaInicial;
    return this.cuotaInicialCalculada;
  }

  // Método para formatear el monto con comas mientras se escribe
  onMontoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remover todo excepto números y punto decimal
    value = value.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal es decir decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Actualizar el valor del formulario (valor numérico sin formato)
    const numericValue = parseFloat(value) || 0;
    this.solicitudPrestamoForm.get('monto')?.setValue(numericValue, { emitEvent: false });
    
    // Actualizar el valor de visualización con formato
    if (value) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        this.montoDisplayValue = num.toLocaleString('en-US');
      }
    } else {
      this.montoDisplayValue = '';
    }
    
    // Recalcular la cuota inicial en tiempo real
    this.calcularCuotaInicial();
  }

  // Método para manejar el cambio del porcentaje
  onPorcentajeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    
    // Actualizar el valor del formulario
    this.solicitudPrestamoForm.get('porcentajeCuotaInicial')?.setValue(value, { emitEvent: false });
    
    // Recalcular la cuota inicial en tiempo real con el nuevo valor
    setTimeout(() => {
      this.calcularCuotaInicial();
    }, 0);
  }

}
