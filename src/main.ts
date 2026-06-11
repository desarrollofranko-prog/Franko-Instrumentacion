// ── Punto de entrada de la aplicación Angular ────────────────────────────────
// Este es el primer archivo que ejecuta el navegador al cargar la app.
// Su única responsabilidad es arrancar (bootstrap) el componente raíz con su configuración global.

// bootstrapApplication: función de Angular para iniciar apps standalone (sin NgModule)
import { bootstrapApplication } from '@angular/platform-browser';

// appConfig: objeto con todos los providers globales (router, preloading, scroll — ver app.config.ts)
import { appConfig } from './app/app.config';

// App: componente raíz que actúa como shell de toda la aplicación (header + router-outlet + footer)
import { App } from './app/app';

// Inicia la aplicación Angular adjuntando el componente App al elemento <app-root> del index.html
// Si la inicialización falla (error de DI, módulo faltante, etc.), se captura y se imprime en consola
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
