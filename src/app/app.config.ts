import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideToastr } from 'ngx-toastr';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

/**
 * =====================================================
 * APP CONFIG - Configuración de la Aplicación
 * =====================================================
 * 
 * Aquí se registran todos los providers globales:
 * - HTTP Client con interceptores
 * - Rutas
 * - Animaciones
 * - Toastr (notificaciones)
 * - Traducciones
 * - PrimeNG
 */

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing',
      tapToDismiss: true,
      newestOnTop: true,
      maxOpened: 5,
      autoDismiss: true
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: "top",
    })),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    /**
     * HTTP Client con Interceptor de Autenticación
     * 
     * withInterceptors([...]) registra los interceptores funcionales
     * El authInterceptor añade el token JWT a cada petición
     */
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    )
  ]
};
