import { Component, OnInit } from '@angular/core';

import { profile } from '../../../../data/header';
import { FeatherIconComponent } from "../../../ui/feather-icon/feather-icon.component";
import { AuthService } from '../../../../services/auth.service';

/**
 * =====================================================
 * PROFILE COMPONENT
 * =====================================================
 * 
 * Muestra el perfil del usuario en el header
 * e incluye el botón de logout
 */

@Component({
  selector: 'app-profile',
  imports: [FeatherIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  public profile = profile;
  
  /** Nombre del usuario logueado */
  public username: string = '';
  public role: string = '';
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Obtener el nombre del usuario
    this.username = this.authService.getUsername() || 'Usuario';
    this.role = this.authService.getRole() || 'Rol';
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
  }
}
