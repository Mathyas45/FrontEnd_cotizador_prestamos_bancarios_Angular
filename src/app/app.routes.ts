import { Routes } from '@angular/router';

import { ContentComponent } from './shared/components/layout/content/content.component';
import { content } from './shared/routes/content.routes';
import { authGuard } from './shared/guards/auth.guard';

/**
 * =====================================================
 * APP ROUTES - Rutas Principales de la Aplicación
 * =====================================================
 * 
 * ARQUITECTURA DE RUTAS:
 * 
 * 1. RUTAS PÚBLICAS (Sin menú lateral):
 *    - /auth/login
 *    - /auth/register
 *    - /auth/forgot-password
 * 
 * 2. RUTAS PRIVADAS (Con menú lateral):
 *    - Todas las demás rutas
 *    - Protegidas por authGuard
 *    - Cargan dentro del ContentComponent
 * 
 * FLUJO:
 * Usuario no logueado → Redirige a /auth/login
 * Usuario logueado → Accede a rutas protegidas
 */

export const routes: Routes = [
    // =====================================================
    // RUTA RAÍZ: Redirige al login
    // =====================================================
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },

    // =====================================================
    // RUTAS DE AUTENTICACIÓN (PÚBLICAS)
    // Sin menú lateral, sin header, sin sidebar
    // =====================================================
    {
        path: 'auth',
        loadChildren: () => import('./components/login/auth.routes').then(r => r.authRoutes)
    },

    // =====================================================
    // RUTAS PROTEGIDAS (PRIVADAS)
    // Con menú lateral, header, sidebar
    // Requieren autenticación (authGuard)
    // =====================================================
    {
        path: '',
        component: ContentComponent, // Layout con sidebar y header
        canActivate: [authGuard],    // 🔒 PROTECCIÓN: Solo usuarios logueados
        children: content,           // Rutas hijas (clientes, préstamos, etc.)
    }
];

