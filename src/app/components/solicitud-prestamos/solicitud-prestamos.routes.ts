
import { Routes } from '@angular/router';

// Importamos los componentes
import { SolicitudPrestamosListComponent } from './solicitud-prestamos-list/solicitud-prestamos-list.component';
import { SolicitudPrestamosFormComponent } from './solicitud-prestamos-form/solicitud-prestamos-form.component';
/**
 * Array de rutas del módulo Solicitud de Préstamos
 * Se exporta como 'solicitudPrestamos' para importarlo en content.routes.ts
 */ 

export const solicitudPrestamos: Routes = [
    {
        // Ruta base: /solicitud-prestamos
        path: '',
    component: SolicitudPrestamosListComponent,
        data: {
            title: 'Solicitud de Préstamos',
            breadcrumb: 'Solicitud de Préstamos'
        }
    },
    {
        // Ruta para crear: /solicitud-prestamos/nuevo
        path: 'register',
        component: SolicitudPrestamosFormComponent,
        data: {
            title: 'Nueva Solicitud de Préstamo',
            breadcrumb: 'Crear Solicitud de Préstamo'
        }
    },
    {       
        path: 'edit/:id',
        component: SolicitudPrestamosFormComponent,
        data: {
            title: 'Editar Solicitud de Préstamo',
            breadcrumb: 'Editar Solicitud de Préstamo'
        }
    }
];