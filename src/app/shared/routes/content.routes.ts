import { Routes } from "@angular/router";

export const content: Routes = [
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
    // MÓDULO DE CLIENTES
    // ========================================
    {
        path: 'clientes',
        loadChildren: () => import('../../components/clientes/clientes.routes').then(r => r.clientes),
        data: {
            title: 'Clientes',
            breadcrumb: 'Clientes'
        }
    },
    // ========================================
    // MÓDULO DE SOLICUTUD DE PRESTAMOS
    // ========================================
    {
        path: 'solicitud-prestamos',
        loadChildren: () => import('../../components/solicitud-prestamos/solicitud-prestamos.routes').then(r => r.solicitudPrestamos),
        data: {
            title: 'Solicitud de Préstamos',
            breadcrumb: 'Solicitud de Préstamos'
        }
    }


]