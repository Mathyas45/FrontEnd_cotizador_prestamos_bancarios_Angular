import { Routes } from "@angular/router";
import { permissionGuard } from "../guards/permission.guard";

export const content: Routes = [
    // ========================================
    // DASHBOARD - PÁGINA PRINCIPAL
    // ========================================
    {
        path: 'dashboard',
        loadChildren: () => import('../../components/dashboard/dashboard.routes').then(r => r.dashboard),
        data: {
            title: 'Dashboard',
            breadcrumb: 'Dashboard'
        }
    },
    {
        path: 'sample-page',
        loadChildren: () => import('../../components/sample-page/sample-page.routes').then(r => r.samplePage),
    },
    {
        path: 'pages',
        loadChildren: () => import('../../components/pages/pages.routes').then(r => r.pages),
        data: {
            breadcrumb: 'Pages'
        }
    },
    // ========================================
    // PÁGINA DE ACCESO DENEGADO
    // ========================================
    {
        path: 'access-denied',
        loadComponent: () => import('../../components/access-denied/access-denied.component').then(c => c.AccessDeniedComponent),
        data: {
            title: 'Acceso Denegado',
            breadcrumb: 'Acceso Denegado'
        }
    },
    // ========================================
    // MÓDULO DE CLIENTES
    // Protegido por permiso READ_CLIENTS
    // ========================================
    {
        path: 'clientes',
        loadChildren: () => import('../../components/clientes/clientes.routes').then(r => r.clientes),
        canActivate: [permissionGuard],
        data: {
            title: 'Clientes',
            breadcrumb: 'Clientes',
            permissions: ['READ_CLIENTS']
        }
    },
    // ========================================
    // MÓDULO DE SOLICUTUD DE PRESTAMOS
    // Protegido por permiso READ_LOANS
    // ========================================
    {
        path: 'solicitud-prestamos',
        loadChildren: () => import('../../components/solicitud-prestamos/solicitud-prestamos.routes').then(r => r.solicitudPrestamos),
        canActivate: [permissionGuard],
        data: {
            title: 'Solicitud de Préstamos',
            breadcrumb: 'Solicitud de Préstamos',
            permissions: ['READ_LOANS']
        }
    },
 

]