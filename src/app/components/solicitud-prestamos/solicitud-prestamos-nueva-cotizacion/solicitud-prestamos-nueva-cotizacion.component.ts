import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// Componentes de la plantilla Cuba
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { SolicitudPrestamosFormComponent } from '../solicitud-prestamos-form/solicitud-prestamos-form.component';
import { SolicitudPrestamo } from '../../../shared/interface/solicitud-prestamos.model';
import { CommonModule } from '@angular/common';//esto es para usar directivas comunes como ngIf, ngFor, etc.
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';// RxJS para manejo de streams y cancelación

// Toastr para notificaciones
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-solicitud-prestamos-nueva-cotizacion',
  imports: [CardComponent, SolicitudPrestamosFormComponent, CommonModule],
  templateUrl: './solicitud-prestamos-nueva-cotizacion.component.html',
  styleUrl: './solicitud-prestamos-nueva-cotizacion.component.scss'
})
export class SolicitudPrestamosNuevaCotizacionComponent {
  
  @ViewChild('SolicitudPrestamosFormComponent') solicitudPrestamosFormComponent!: SolicitudPrestamosFormComponent;
  
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
   * @param toastr - Para mostrar notificaciones
   * @param router - Para navegación entre vistas
   */
  constructor(
    private toastr: ToastrService,
    private router: Router
  ) { }


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


  // Variable para almacenar la solicitud cotizada
  solicitudCotizada: SolicitudPrestamo | null = null;


  /**
   * Cotiza la solicitud (sin guardar en BD)
   */
  cotizarSolicitud(): void {
    console.log('cotizarSolicitud llamado');
    if (this.solicitudPrestamosFormComponent) {
      this.solicitudPrestamosFormComponent.onSubmitCotizar();
    } else {
      console.error('El componente del formulario no está disponible.');
    }
  }

  /**
   * Guarda la solicitud en la base de datos
   */
  guardarSolicitud(): void {
    // Confirmación con SweetAlert2
    Swal.fire({
      title: '¿Estás seguro?',
      html: `Estás a punto de guardar la solicitud de préstamo, ¿deseas continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      // Si el usuario confirma
      if (result.isConfirmed) {
        if (this.solicitudPrestamosFormComponent) {
          // Solo llamar al submit, el formulario emitirá el evento onSaved cuando termine
          this.solicitudPrestamosFormComponent.onSubmit();
        } else {
          console.error('El componente del formulario no está disponible.');
        }
      }
    });
  }

  /**
   * Verifica si el formulario es inválido
   */
  isFormInvalid(): boolean {
    return this.solicitudPrestamosFormComponent ?.solicitudPrestamoForm.invalid || false; // Devuelve true si el formulario es inválido
  }

   /**
   * Verifica si el formulario está enviando datos
   */
  isFormSubmitting(): boolean {
    return this.solicitudPrestamosFormComponent ?.isSubmitting || false; // Devuelve true si el formulario está enviando datos
  }

  /**
   * Captura la solicitud cotizada del componente hijo
   */
  onSolicitudCotizada(solicitud: SolicitudPrestamo): void {
    console.log('Solicitud cotizada recibida en el padre:', solicitud);
    // Forzar actualización creando una nueva referencia del objeto
    this.solicitudCotizada = { ...solicitud };
    // Mostrar notificación de éxito
    this.toastr.success('Cotización actualizada con éxito.', 'Éxito');
  }

  /**
   * Captura cuando se guarda exitosamente para navegar al listado
   */
  onSolicitudGuardada(solicitud: SolicitudPrestamo): void {
    console.log('Solicitud guardada exitosamente:', solicitud);
    // Navegar hacia el listado
    this.router.navigate(['/solicitud-prestamos']);
  }

  goBack(): void {
    window.history.back();
    } 

}
