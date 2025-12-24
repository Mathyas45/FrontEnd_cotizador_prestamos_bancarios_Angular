import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginRequest } from '../../../shared/interface';

/**
 * =====================================================
 * LOGIN FORM COMPONENT
 * =====================================================
 * 
 * Formulario de inicio de sesión conectado al backend Java
 * 
 * FLUJO:
 * 1. Usuario ingresa credenciales
 * 2. Se envían al backend vía AuthService
 * 3. Backend valida y retorna JWT
 * 4. AuthService guarda el token
 * 5. Redirige al dashboard o URL de retorno
 * 
 * BUENAS PRÁCTICAS APLICADAS:
 * 1. Reactive Forms para validación robusta
 * 2. Manejo de estados de carga
 * 3. Mensajes de error claros
 * 4. Redirección inteligente
 */

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {

  // Input para recibir la ruta de registro desde el componente padre
  @Input() path: string = '/auth/register';

  // =====================================================
  // PROPIEDADES DEL COMPONENTE
  // =====================================================
  
  /** Formulario reactivo */
  loginForm!: FormGroup;
  
  /** Estado de carga durante el login */
  isLoading: boolean = false;
  
  /** Mensaje de error para mostrar al usuario */
  errorMessage: string = '';
  
  /** Controla la visibilidad del password */
  showPassword: boolean = false;
  
  /** URL a la que redirigir después del login */
  returnUrl: string = '/dashboard'; // Ruta por defecto (dashboard)

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getReturnUrl();
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Obtiene la URL de retorno de los query params
   */
  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // =====================================================
  // ACCIONES DEL FORMULARIO
  // =====================================================

  /**
   * Envía el formulario de login
   */
  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const credentials: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Maneja los errores del login
   */
  private handleLoginError(error: any): void {
    console.error('Error en login:', error);

    if (error.status === 401) {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    } else if (error.status === 0) {
      this.errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error en el servidor. Intenta más tarde.';
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = 'Ocurrió un error. Intenta de nuevo.';
    }
  }

  /**
   * Alterna la visibilidad del password
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // =====================================================
  // HELPERS PARA LA PLANTILLA
  // =====================================================

  /**
   * Verifica si un campo tiene errores y fue tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.errors['email']) {
      return 'Ingresa un email válido';
    }

    return 'Campo inválido';
  }
}
