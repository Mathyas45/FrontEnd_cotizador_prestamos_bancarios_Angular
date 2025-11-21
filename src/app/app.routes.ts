import { Routes } from '@angular/router';

import { ContentComponent } from './shared/components/layout/content/content.component';
import { content } from './shared/routes/content.routes';

export const routes: Routes = [//esto sirve para las rutas principales de la app
    {
        path: '',
        redirectTo: '/sample-page',
        pathMatch: 'full'
    },
    {
        path: '',
        component: ContentComponent,//esto es el layout principal es donde se cargan las demas rutas hijas, por ejemplo clientes, productos, etc.
        children: content,
    }
];
