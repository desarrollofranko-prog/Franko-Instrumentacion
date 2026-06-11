// ── Página de detalle de producto (ficha técnica) ────────────────────────────
// Fuente de datos: ProductService → productos.json (local, sin Firebase)
// URL: /productos/:id  — :id puede ser slug o serie numérica

import {
  ChangeDetectionStrategy, Component, OnInit, OnDestroy,
  HostListener, ChangeDetectorRef, signal
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ProductService }    from '../../services/product.service';
import { CotizacionService } from '../../services/cotizacion.service';
import { Producto, TabId }   from '../../models/producto.model';
import { getSpecsImageUrl, getCatalogImageUrl, onImagenError } from '../../../utils/image.helper';

@Component({
  selector: 'app-specs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './specs.html',
  styleUrl: './specs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Specs implements OnInit, OnDestroy {

  // ── Estado principal ───────────────────────────────────────────────────────
  producto: Producto | null = null;
  productosRelacionados: Producto[] = [];
  tabs: TabId[] = [];
  tabActivo: TabId = 'informacion-general';
  notFound  = false;
  cargando  = true;

  // CTA sticky visible al hacer scroll > 480px
  stickyVisible = signal(false);

  // ── Galería ────────────────────────────────────────────────────────────────
  galeria:      string[] = [];
  imagenActiva  = '';
  imagenIndex   = 0;
  imagenFading  = false;

  readonly onImageError = onImagenError;

  private subs = new Subscription();

  constructor(
    private route:        ActivatedRoute,
    private productSvc:   ProductService,
    private cotizacion:   CotizacionService,
    private cdr:          ChangeDetectorRef,
  ) {}

  @HostListener('window:scroll')
  onScroll() { this.stickyVisible.set(window.scrollY > 480); }

  ngOnInit(): void {
    const sub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id') ?? '';
        this._resetEstado();
        return this.productSvc.getProductoBySlug(id);
      })
    ).subscribe(producto => {
      this.cargando = false;

      if (!producto) {
        this.notFound = true;
        this.cdr.markForCheck();
        return;
      }

      this.producto = producto;
      this.tabs     = producto.tabs;
      this.tabActivo = producto.tabs[0];

      // Construir galería con URLs completas de fotos-especificaciones
      this.galeria = producto.galeria.length > 0
        ? producto.galeria.map(img => getSpecsImageUrl(img.archivo))
        : [getSpecsImageUrl(producto.imagen)];

      this.imagenActiva = this.galeria[0] ?? '';
      this.imagenIndex  = 0;

      this._cargarRelacionados(producto);
      this.cdr.markForCheck();
    });

    this.subs.add(sub);
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ── Relacionados ──────────────────────────────────────────────────────────
  private _cargarRelacionados(producto: Producto): void {
    const sub = this.productSvc
      .getProductosByCategoria(producto.categoriaId, producto.slug)
      .subscribe(todos => {
        this.productosRelacionados = todos.slice(0, 3).map(p => ({
          ...p,
          imagen: getCatalogImageUrl(p.imagen),
        }));
        this.cdr.markForCheck();
      });
    this.subs.add(sub);
  }

  private _resetEstado(): void {
    this.cargando  = true;
    this.notFound  = false;
    this.galeria   = [];
    this.imagenActiva = '';
    this.tabs      = [];
    this.tabActivo = 'informacion-general';
    this.producto  = null;
    this.productosRelacionados = [];
    this.cdr.markForCheck();
  }

  // ── Galería ────────────────────────────────────────────────────────────────
  setImagenActiva(img: string): void {
    if (this.imagenActiva === img || this.imagenFading) return;
    this.imagenFading = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.imagenActiva = img;
      this.imagenIndex  = this.galeria.indexOf(img);
      this.imagenFading = false;
      this.cdr.markForCheck();
    }, 220);
  }

  siguienteImagen(): void {
    if (this.galeria.length <= 1) return;
    this.setImagenActiva(this.galeria[(this.imagenIndex + 1) % this.galeria.length]);
  }

  anteriorImagen(): void {
    if (this.galeria.length <= 1) return;
    this.setImagenActiva(this.galeria[(this.imagenIndex - 1 + this.galeria.length) % this.galeria.length]);
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  setTab(tab: TabId): void {
    this.tabActivo = tab;
    this.cdr.markForCheck();
  }

  getNombreTab(tabId: TabId): string {
    const nombres: Record<TabId, string> = {
      'informacion-general':        'Información General',
      'ventajas-de-nuestra-marca':  'Ventajas de Nuestra Marca',
      'accesorios':                 'Accesorios',
    };
    return nombres[tabId] ?? tabId;
  }

  // ── Cotización ─────────────────────────────────────────────────────────────
  cotizar(): void {
    if (!this.producto) return;
    this.cotizacion.abrirAlertaCorreo({
      nombre:          this.producto.titulo,
      serie:           `Serie ${this.producto.serie}`,
      descripcion:     this.producto.descripcionCorta,
      categoriaNombre: this.producto.categoriaNombre,
    });
  }

  cotizarRelacionado(rel: Producto): void {
    this.cotizacion.abrirAlertaCorreo({
      nombre:          rel.titulo,
      serie:           `Serie ${rel.serie}`,
      descripcion:     rel.descripcionCorta,
      categoriaNombre: rel.categoriaNombre,
    });
  }

  // ── CSS dinámico ───────────────────────────────────────────────────────────
  getSerieClass(serie: string): string {
    const n = parseInt(serie.replace(/\D/g, ''), 10);
    if (n >= 1000 && n < 2000) return 'serie-morado';
    if (n >= 2000 && n < 3000) return 'serie-ambar';
    if (n >= 3000 && n < 4000) return 'serie-morado';
    if (n >= 4000 && n < 6000) return 'serie-verde';
    if (n >= 6000)              return 'serie-azul';
    return '';
  }
}
