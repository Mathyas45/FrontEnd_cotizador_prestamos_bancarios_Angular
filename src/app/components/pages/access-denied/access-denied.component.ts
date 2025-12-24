import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * =====================================================
 * ACCESS DENIED COMPONENT
 * =====================================================
 * 
 * Página que se muestra cuando un usuario intenta
 * acceder a una ruta para la que no tiene permisos.
 */
@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="error-wrapper d-flex align-items-center justify-content-center" style="min-height: 80vh;">
            <div class="text-center">
              <!-- Icono de acceso denegado -->
              <div class="error-icon mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" 
                     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" 
                     class="text-danger">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </div>
              
              <!-- Título -->
              <h1 class="display-4 text-danger mb-3">403</h1>
              <h2 class="mb-3">Acceso Denegado</h2>
              
              <!-- Mensaje descriptivo -->
              <p class="text-muted mb-4">
                No tienes permisos suficientes para acceder a esta página.<br>
                Contacta al administrador si crees que esto es un error.
              </p>
              
              <!-- Botones de acción -->
              <div class="d-flex gap-3 justify-content-center">
                <a routerLink="/" class="btn btn-primary">
                  <i class="fa fa-home me-2"></i>
                  Ir al Inicio
                </a>
                <button class="btn btn-outline-secondary" (click)="goBack()">
                  <i class="fa fa-arrow-left me-2"></i>
                  Volver Atrás
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-wrapper {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 10px;
      padding: 40px;
    }
    
    .error-icon {
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    
    h1.display-4 {
      font-size: 6rem;
      font-weight: 700;
    }
    
    h2 {
      font-weight: 600;
      color: #333;
    }
  `]
})
export class AccessDeniedComponent {
  
  goBack(): void {
    window.history.back();
  }
}
