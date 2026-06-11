// ── Página de contenido legal (Términos de Uso / Aviso de Privacidad) ────────
// Un solo componente sirve dos rutas legales:
//   /terminos-de-uso      → muestra el contenido de Términos de Uso
//   /aviso-de-privacidad  → muestra el Aviso de Privacidad
// El componente decide qué texto mostrar leyendo la URL activa en ngOnInit.
// El contenido legal está directamente en el template HTML (no viene de un servicio).

// ChangeDetectionStrategy: enum para elegir la estrategia de renderizado del componente
// Component: decorador principal de Angular
// OnInit: interfaz de ciclo de vida — ngOnInit() se ejecuta tras crear el componente
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

// CommonModule: habilita directivas *ngIf y *ngFor en el template standalone
import { CommonModule } from '@angular/common';

// RouterModule: habilita routerLink en el template para los enlaces del breadcrumb y CTA
// Router: servicio que permite leer la URL activa (router.url) para determinar qué contenido mostrar
import { RouterModule, Router } from '@angular/router';

// @Component: configura la metadata del componente Legal
@Component({
  selector: 'app-legal',           // Tag HTML del componente (usado por el router)
  standalone: true,                 // No necesita NgModule
  imports: [CommonModule, RouterModule], // Módulos necesarios para el template
  templateUrl: './legal.html',      // HTML con los bloques de contenido legal (condicionados por this.tipo)
  styleUrl: './legal.scss',         // SCSS encapsulado: hero, breadcrumb, tabla de contenidos y tipografía legal
  changeDetection: ChangeDetectionStrategy.OnPush, // Detección eficiente: los datos son estáticos tras ngOnInit
})
export class Legal implements OnInit {
  // Determina qué bloque de contenido legal renderiza el template:
  //   'terminos'   → Términos de Uso (ruta /terminos-de-uso)
  //   'privacidad' → Aviso de Privacidad (ruta /aviso-de-privacidad)
  tipo: 'terminos' | 'privacidad' = 'terminos';

  // Título de la página que se muestra en el hero y en la tabla de contenidos
  // Se asigna en ngOnInit según el tipo detectado
  titulo = '';

  // Fecha de la última actualización del documento legal (se muestra en el hero)
  fecha = '1 de enero de 2026';

  constructor(private router: Router) {} // Router: permite leer la URL activa sin suscripciones

  // ngOnInit: se ejecuta una vez al crear el componente
  // Lee la URL activa para determinar si se está mostrando términos o privacidad
  ngOnInit(): void {
    const url = this.router.url; // Obtiene la URL activa, ej. "/aviso-de-privacidad"
    if (url.includes('aviso-de-privacidad')) {
      // La URL contiene 'aviso-de-privacidad': configura el componente para el aviso de privacidad
      this.tipo = 'privacidad';
      this.titulo = 'Aviso de Privacidad';
    } else {
      // Por defecto (o si la URL contiene 'terminos-de-uso'): muestra los términos de uso
      this.tipo = 'terminos';
      this.titulo = 'Términos de Uso';
    }
  }
}
