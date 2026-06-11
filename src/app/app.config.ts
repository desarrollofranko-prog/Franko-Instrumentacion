// ── Configuración global de la aplicación ────────────────────────────────────
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  PreloadAllModules, provideRouter,
  withInMemoryScrolling, withPreloading, withRouterConfig
} from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        anchorScrolling:           'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
  ],
};
