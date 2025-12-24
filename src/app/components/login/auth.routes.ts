import { Routes } from '@angular/router';
import { publicGuard } from '../../shared/guards/auth.guard';

/**
 * =====================================================
 * AUTH ROUTES - Rutas de Autenticación
 * =====================================================
 * 
 * Estas rutas son PÚBLICAS (sin menú lateral)
 * Solo accesibles cuando NO estás logueado
 * 
 * El publicGuard evita que usuarios logueados
 * vean estas páginas (los redirige al dashboard)
 */

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginBgImageThreeComponent),
    canActivate: [publicGuard], // Solo si NO está logueado, esto sirve para proteger la ruta
    data: {
      title: 'Iniciar Sesión',
    }
  },
  // Puedes agregar más rutas de auth aquí:
  // {
  //   path: 'register',
  //   loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
  //   canActivate: [publicGuard],
  // },
  // {
  //   path: 'forgot-password',
  //   loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  //   canActivate: [publicGuard],
  // },
];
