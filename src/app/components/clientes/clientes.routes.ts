/**
 * ============================================
 * RUTAS DEL MÓDULO: CLIENTES
 * ============================================
 * 
 * Este archivo define todas las rutas del módulo de clientes.
 * Es similar al router de Vue.
 * 
 * RUTAS DEFINIDAS:
 * - /clientes → Lista de clientes
 * - /clientes/nuevo → Crear cliente
 * - /clientes/editar/:id → Editar cliente
 * 
 * NOTA: Estas rutas se cargan de forma LAZY (carga diferida)
 *       Solo se descargan cuando el usuario navega a ellas
 *       Esto mejora el rendimiento inicial de la app
 */

import { Routes } from '@angular/router';

// Importamos los componentes
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';

/**
 * Array de rutas del módulo Clientes
 * Se exporta como 'clientes' para importarlo en content.routes.ts
 */
export const clientes: Routes = [
  {
    // Ruta base: /clientes
    path: '',
    component: ClienteListComponent,
    data: {
      title: 'Clientes',
      breadcrumb: 'Listado de Clientes'
    }
  },
  {
    // Ruta para crear: /clientes/nuevo
    path: 'nuevo',
    component: ClienteFormComponent,
    data: {
      title: 'Nuevo Cliente',
      breadcrumb: 'Crear Cliente'
    }
  },
  {
    // Ruta para editar: /clientes/editar/123
    // :id es un parámetro dinámico (como en Vue Router)
    path: 'editar/:id',
    component: ClienteFormComponent,
    data: {
      title: 'Editar Cliente',
      breadcrumb: 'Editar Cliente'
    }
  }
];
