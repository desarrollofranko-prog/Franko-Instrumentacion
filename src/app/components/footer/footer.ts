// ── Componente de pie de página ───────────────────────────────────────────────
// Se muestra en todas las rutas porque está declarado directamente en app.html.
// Responsabilidades:
//   - Mostrar links de navegación, redes sociales, datos de contacto e insignias ISO
//   - Controlar la visibilidad del botón "Volver al inicio" según la posición del scroll
// No depende de servicios externos; su único estado es la señal showBackToTop.

// ChangeDetectionStrategy: enum para elegir la estrategia de renderizado del componente
// Component: decorador que convierte la clase en un componente Angular con template y estilos
// HostListener: decorador que suscribe métodos de la clase a eventos del DOM (ej. scroll, resize)
// signal: función de Angular Signals para crear estado reactivo que actualiza la vista automáticamente
import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

// RouterModule: habilita la directiva routerLink en el template para navegación interna sin recargar la página
import { RouterModule } from '@angular/router';

// CommonModule: provee directivas como *ngIf y *ngFor en componentes standalone
import { CommonModule } from '@angular/common';

// @Component: configura la metadata del componente Footer
@Component({
  selector: 'app-footer',          // Tag HTML que representa este componente: usado en app.html como <app-footer>
  standalone: true,                // No necesita ser declarado en ningún NgModule externo
  imports: [RouterModule, CommonModule], // RouterModule: routerLink para links internos; CommonModule: *ngIf para mostrar/ocultar el botón
  templateUrl: './footer.html',    // HTML del pie de página con columnas, redes, copyright y botón de scroll
  styleUrl: './footer.scss',       // SCSS encapsulado: estilos del footer que no afectan al resto de la app
  changeDetection: ChangeDetectionStrategy.OnPush, // Solo re-renderiza cuando cambia el signal showBackToTop
})
export class Footer {
  // Signal de Angular: valor reactivo que dispara la re-renderización de la vista cuando cambia
  // showBackToTop: true → el botón "Volver al inicio" es visible; false → está oculto
  // Valor inicial: false (el usuario no ha scrolleado todavía al cargar la página)
  showBackToTop = signal(false);

  // @HostListener('window:scroll'): escucha el evento scroll en el objeto window global
  // Angular llama a este método en cada evento de scroll de la página
  @HostListener('window:scroll')
  onScroll() {
    // window.scrollY: distancia en píxeles desde la parte superior del documento hasta la posición actual
    // Si el usuario ha scrolleado más de 400px, activa el botón; si no, lo oculta
    // signal.set(): actualiza el valor del signal y dispara la re-renderización automáticamente
    this.showBackToTop.set(window.scrollY > 400);
  }

  // Desplaza la página suavemente hasta el tope cuando el usuario hace clic en el botón
  // window.scrollTo: API nativa del navegador para controlar el scroll programáticamente
  // behavior: 'smooth' activa la animación CSS de desplazamiento gradual
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
