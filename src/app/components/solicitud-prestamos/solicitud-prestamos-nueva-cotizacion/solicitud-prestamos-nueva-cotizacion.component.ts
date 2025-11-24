import { Component, ViewChild } from '@angular/core';
// Componentes de la plantilla Cuba
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { SolicitudPrestamosFormComponent } from '../solicitud-prestamos-form/solicitud-prestamos-form.component';
import { SolicitudPrestamo } from '../../../shared/interface/solicitud-prestamos.model';
import { CommonModule } from '@angular/common';//esto es para usar directivas comunes como ngIf, ngFor, etc.

@Component({
  selector: 'app-solicitud-prestamos-nueva-cotizacion',
  imports: [CardComponent, SolicitudPrestamosFormComponent, CommonModule],
  templateUrl: './solicitud-prestamos-nueva-cotizacion.component.html',
  styleUrl: './solicitud-prestamos-nueva-cotizacion.component.scss'
})
export class SolicitudPrestamosNuevaCotizacionComponent {
  
  @ViewChild('SolicitudPrestamosFormComponent') solicitudPrestamosFormComponent!: SolicitudPrestamosFormComponent;
  
  // Variable para almacenar la solicitud cotizada
  solicitudCotizada: SolicitudPrestamo | null = null;


  /**
   * Envía el formulario llamando al método onSubmit del componente hijo
   */
  submitForm(): void {
    console.log('submitForm llamado');
    if (this.solicitudPrestamosFormComponent) {
      this.solicitudPrestamosFormComponent.onSubmitCotizar();
    }else {
      console.error('El componente del formulario no está disponible.');
    }
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
    this.solicitudCotizada = solicitud;
  }

}
