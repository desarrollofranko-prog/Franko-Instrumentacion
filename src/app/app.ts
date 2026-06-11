// ── Componente raíz de la aplicación ─────────────────────────────────────────
// Define la estructura base (shell) que envuelve todas las páginas:
//   Header fijo (siempre visible en la parte superior)
//   RouterOutlet (zona de contenido donde Angular renderiza la página activa según la URL)
//   Footer fijo (siempre visible al pie de la página)
// Este componente no tiene lógica propia: solo actúa como contenedor de layout.

// ChangeDetectionStrategy: permite elegir la estrategia de detección de cambios del componente
// Component: decorador que convierte una clase TypeScript en un componente Angular
import { ChangeDetectionStrategy, Component } from '@angular/core';

// RouterOutlet: directiva que actúa como marcador de posición donde Angular inserta
// el componente correspondiente a la ruta URL activa
import { RouterOutlet } from '@angular/router';

// Header y Footer: componentes standalone de cabecera y pie de página
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

// @Component: configura la metadata del componente raíz
@Component({
  selector: 'app-root',           // Tag HTML donde Bootstrap adjunta la app en index.html: <app-root>
  standalone: true,               // Componente autónomo: no necesita ser declarado en un NgModule
  imports: [RouterOutlet, Header, Footer], // RouterOutlet: placeholder para páginas; Header y Footer: persistentes en todas las rutas
  templateUrl: './app.html',      // HTML del shell: <app-header>, <router-outlet>, <app-footer>
  styleUrl: './app.scss',         // SCSS: solo ajusta el padding-top del contenido para compensar el header fijo
  changeDetection: ChangeDetectionStrategy.OnPush, // Estrategia eficiente: solo re-renderiza si cambia un input o un evento interno
})
export class App {}
