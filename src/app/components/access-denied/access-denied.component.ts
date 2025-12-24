import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * =====================================================
 * ACCESS DENIED COMPONENT
 * =====================================================
 * 
 * Página mostrada cuando el usuario intenta acceder
 * a una ruta sin los permisos necesarios.
 * 
 * Esta página es redirigida por:
 * - permissionGuard
 * - roleGuard
 */
@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="error-wrapper d-flex align-items-center justify-content-center min-vh-100">
            <div class="text-center">
              <!-- Icono -->
              <div class="error-icon mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </div>

              <!-- Título -->
              <h1 class="display-4 text-danger mb-3">403</h1>
              <h2 class="h3 mb-3">Acceso Denegado</h2>
              
              <!-- Mensaje -->
              <p class="text-muted mb-4">
                No tienes los permisos necesarios para acceder a esta página.
                <br>
                Contacta al administrador si crees que esto es un error.
              </p>

              <!-- Botones de navegación -->
              <div class="d-flex gap-3 justify-content-center">
                <a routerLink="/dashboard" class="btn btn-primary">
                  <i class="fa fa-home me-2"></i>
                  Ir al Dashboard
                </a>
                <button (click)="goBack()" class="btn btn-outline-secondary">
                  <i class="fa fa-arrow-left me-2"></i>
                  Volver
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
    }
    
    .error-icon {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .text-danger {
      color: #dc3545 !important;
    }
  `]
})
export class AccessDeniedComponent {
  
  goBack(): void {
    window.history.back();
  }
}
