// ── Página "Acerca de" — Historia y valores de Franko ────────────────────────
// Muestra información institucional de la empresa:
//   - Misión y texto de presentación con imagen y badge ISO
//   - Valores corporativos (Seguridad, Calidad, Compromiso, Innovación)
//   - Línea de tiempo vertical (hitos históricos de 1990 a 2024)
//   - Grid de certificaciones y normas que cumple la empresa
//   - Proceso de fabricación en 6 pasos
// Este componente no tiene lógica dinámica; solo define datos estáticos y el template los renderiza.

// ChangeDetectionStrategy: enum para elegir la estrategia de detección de cambios
// Component: decorador principal que define un componente Angular
import { ChangeDetectionStrategy, Component } from '@angular/core';

// CommonModule: habilita directivas estructurales *ngFor y *ngIf en el template
import { CommonModule } from '@angular/common';

// RouterModule: habilita routerLink para los enlaces de navegación internos del breadcrumb y CTA
import { RouterModule } from '@angular/router';

// @Component: configura la metadata del componente AcercaDe
@Component({
  selector: 'app-acerca-de',       // Tag HTML del componente (usado por el router)
  standalone: true,                 // No necesita NgModule
  imports: [CommonModule, RouterModule], // Módulos necesarios para directivas del template
  templateUrl: './acerca-de.html',  // HTML con las secciones: misión, valores, hitos, certificaciones, fabricación
  styleUrl: './acerca-de.scss',     // SCSS encapsulado: estilos de la línea de tiempo, cards y hero
  changeDetection: ChangeDetectionStrategy.OnPush, // Estrategia eficiente: solo re-renderiza por eventos o inputs
})
export class AcercaDe {
  // ── Datos de la línea de tiempo histórica ────────────────────────────────
  // Cada objeto representa un hito importante en la historia de Franko
  // anio: año del evento (se muestra en el nodo de la línea de tiempo)
  // desc: descripción del evento mostrada en la tarjeta del hito
  hitos = [
    { anio: '1990', desc: 'Fundación de Franko en Ciudad López Mateos, Edo. de México, con el objetivo de fabricar válvulas de alivio de calidad internacional.' },
    { anio: '1998', desc: 'Expansión de la línea de productos con arrestadores de flama certificados bajo norma ISO 16852.' },
    { anio: '2005', desc: 'Obtención de la certificación ISO 9001 en manufactura y pruebas de productos de instrumentación industrial.' },
    { anio: '2012', desc: 'Incorporación de maquinaria CNC de alta precisión para mecanizado de aceros y aleaciones especiales.' },
    { anio: '2019', desc: 'Lanzamiento de la línea de equipos de medición y control de nivel para tanques industriales.' },
    { anio: '2024', desc: 'Más de 35 años protegiendo industrias en México con más de 30 líneas de producto certificadas.' },
  ];

  // ── Datos de valores corporativos ────────────────────────────────────────
  // Cada objeto representa un valor de la empresa mostrado como tarjeta con icono, título y descripción
  // icon: clase de Bootstrap Icons para el icono visual de la tarjeta
  valores = [
    { icon: 'bi bi-shield-check', titulo: 'Seguridad', desc: 'Cada producto que fabricamos pasa por rigurosos procesos de prueba antes de salir de nuestra planta.' },
    { icon: 'bi bi-patch-check', titulo: 'Calidad', desc: 'Certificación ISO 9001 en cada etapa de fabricación, desde la selección de materiales hasta la entrega final.' },
    { icon: 'bi bi-people-fill', titulo: 'Compromiso', desc: 'Más de 35 años de relaciones duraderas con los principales grupos industriales de México.' },
    { icon: 'bi bi-lightbulb-fill', titulo: 'Innovación', desc: 'Mejora continua de procesos y productos para responder a las necesidades cambiantes de la industria.' },
  ];

  // ── Datos de certificaciones y normas ────────────────────────────────────
  // Cada objeto representa una certificación o norma que cumple la empresa
  // icono: clase Bootstrap Icons | nombre: identificador de la norma | desc: descripción corta
  certificaciones = [
    { icono: 'bi bi-patch-check-fill', nombre: 'ISO 9001', desc: 'Sistema de gestión de calidad certificado para manufactura y pruebas de productos industriales.' },
    { icono: 'bi bi-fire', nombre: 'ISO 16852', desc: 'Norma internacional para arrestadores de flama — protección contra ignición y explosión.' },
    { icono: 'bi bi-shield-fill-check', nombre: 'ASME / API', desc: 'Diseño y pruebas bajo estándares ASME VIII y API 520/526 para válvulas de alivio de presión.' },
    { icono: 'bi bi-lightning-charge-fill', nombre: 'NOM / NMX', desc: 'Cumplimiento con normas mexicanas oficiales aplicables a instrumentación y seguridad industrial.' },
    { icono: 'bi bi-globe2', nombre: 'CE / ATEX', desc: 'Compatibilidad con directivas europeas para equipos en atmósferas potencialmente explosivas.' },
    { icono: 'bi bi-clipboard2-check-fill', nombre: 'Trazabilidad', desc: 'Documentación completa de materiales, pruebas y calibraciones por número de serie y lote.' },
  ];

  // ── Datos del proceso de fabricación ─────────────────────────────────────
  // Cada objeto describe un paso del proceso productivo en la planta de Franko
  // icono: Bootstrap Icons | titulo: nombre del paso | desc: descripción técnica breve
  pasosFabricacion = [
    { icono: 'bi bi-rulers', titulo: 'Diseño e ingeniería', desc: 'Cálculo de parámetros de operación, selección de materiales y generación de planos técnicos certificados.' },
    { icono: 'bi bi-box-seam-fill', titulo: 'Selección de materiales', desc: 'Adquisición de aceros, bronces y aleaciones especiales con certificados de calidad de origen.' },
    { icono: 'bi bi-gear-wide-connected', titulo: 'Mecanizado CNC', desc: 'Torneado y fresado de alta precisión en nuestros centros de maquinado CNC para tolerancias estrechas.' },
    { icono: 'bi bi-fire', titulo: 'Tratamientos y acabados', desc: 'Niquelado, fosfatado y otros tratamientos superficiales para resistencia a corrosión y al desgaste.' },
    { icono: 'bi bi-tools', titulo: 'Ensamble y ajuste', desc: 'Integración de componentes y calibración de presión de apertura, cierre y resortes de regulación.' },
    { icono: 'bi bi-clipboard2-pulse-fill', titulo: 'Pruebas y certificación', desc: 'Prueba hidrostática, neumática y de hermeticidad bajo norma ISO/ASME con reporte de trazabilidad.' },
  ];
}
