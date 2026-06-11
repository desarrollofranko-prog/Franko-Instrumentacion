// ── Rutas de Franko Instrumentación Web V3 ───────────────────────────────────
// Todas las rutas usan lazy loading (loadComponent) para dividir el bundle.
// Datos de productos desde JSON local (src/app/data/productos.json).

import { Routes } from '@angular/router';

export const routes: Routes = [

  // ── Página principal ────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },

  // ── Catálogo de productos ──────────────────────────────────────────────────────
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos').then(m => m.Productos),
  },

  // ── Detalle de producto — :id puede ser slug o serie ────────────────────────
  {
    path: 'productos/:id',
    loadComponent: () => import('./pages/specs/specs').then(m => m.Specs),
  },

  // ── Páginas institucionales (del Proyecto A) ─────────────────────────────────
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto').then(m => m.Contacto),
  },
  {
    path: 'acerca-de',
    loadComponent: () => import('./pages/acerca-de/acerca-de').then(m => m.AcercaDe),
  },

  // ── Guías de industria ───────────────────────────────────────────────────────
  {
    path: 'guia-de-productos-destilerias',
    loadComponent: () => import('./pages/industria/industria').then(m => m.Industria),
  },
  {
    path: 'guia-de-productos-petroquimicas',
    loadComponent: () => import('./pages/industria/industria').then(m => m.Industria),
  },
  {
    path: 'guia-de-productos-biogas',
    loadComponent: () => import('./pages/industria/industria').then(m => m.Industria),
  },
  {
    path: 'guia-de-productos-refinerias',
    loadComponent: () => import('./pages/industria/industria').then(m => m.Industria),
  },

  // ── Páginas legales ──────────────────────────────────────────────────────────
  {
    path: 'terminos-de-uso',
    loadComponent: () => import('./pages/legal/legal').then(m => m.Legal),
  },
  {
    path: 'aviso-de-privacidad',
    loadComponent: () => import('./pages/legal/legal').then(m => m.Legal),
  },

  // ── Wildcard — redirige cualquier URL desconocida al home ────────────────────
  { path: '**', redirectTo: '' },
];
