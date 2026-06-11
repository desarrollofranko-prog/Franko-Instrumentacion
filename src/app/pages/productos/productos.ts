// ── Página del catálogo de productos ─────────────────────────────────────────
// Fuente de datos: ProductService → productos.json (local, sin Firebase)

import {
  ChangeDetectionStrategy, Component, AfterViewInit,
  OnDestroy, OnInit, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProductService }    from '../../services/product.service';
import { Producto }          from '../../models/producto.model';
import { ImagenUrlPipe }     from '../../pipes/imagen-url.pipe';
import { CotizacionService } from '../../services/cotizacion.service';
import { getCatalogImageUrl } from '../../../utils/image.helper';

interface ProductoVista {
  nombre:      string;
  serie:       string;
  imagen:      string;
  descripcion: string;
  ruta:        string;
}

interface CategoriaVista {
  id:             string;
  nombre:         string;
  descripcionCat: string;
  industrias:     string[];
  color:          string;
  productos:      ProductoVista[];
}

const CAT_META: Record<string, { descripcion: string; industrias: string[]; color: string }> = {
  'alivio-de-presion': {
    descripcion: 'Válvulas de alivio de presión y vacío diseñadas bajo API 2000 e ISO 28300 para tanques de almacenamiento.',
    industrias:  ['Petroquímica', 'Refinería', 'Almacenamiento'],
    color: 'cat-morado',
  },
  'tank-blanketing': {
    descripcion: 'Válvulas reguladoras para inertización de tanques con nitrógeno u otros gases inertes.',
    industrias:  ['Química', 'Farmacéutica', 'Alimenticia'],
    color: 'cat-morado',
  },
  'arrestadores-de-flama': {
    descripcion: 'Arrestadores certificados ISO 16852 para líneas y tanques con gases inflamables.',
    industrias:  ['Destilerías', 'Biogás', 'Química'],
    color: 'cat-ambar',
  },
  'formadores-de-espuma': {
    descripcion: 'Cámaras de espuma y accesorios para sistemas de extinción de incendios en tanques.',
    industrias:  ['Refinería', 'Petroquímica', 'Protección CI'],
    color: 'cat-ambar',
  },
  'accesorios': {
    descripcion: 'Escotillas, ventilas de emergencia y accesorios para tanques de almacenamiento.',
    industrias:  ['Industria general', 'Petroquímica', 'Química'],
    color: 'cat-verde',
  },
  'alivio-de-presion-emergente': {
    descripcion: 'Ventilas de emergencia para alivio de presión en condiciones de incendio o sobrepresión.',
    industrias:  ['Almacenamiento', 'Refinería', 'Química'],
    color: 'cat-verde',
  },
  'medicion-y-control-de-nivel': {
    descripcion: 'Indicadores, transmisores y switches de nivel para tanques en cualquier condición de proceso.',
    industrias:  ['Industria en general', 'Petroquímica', 'Química'],
    color: 'cat-azul',
  },
  'visores-y-mirillas': {
    descripcion: 'Mirillas y visores de flujo para observación visual de procesos en tuberías y contenedores.',
    industrias:  ['Proceso', 'Química', 'Alimenticia'],
    color: 'cat-azul',
  },
};

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, ImagenUrlPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Productos implements OnInit, AfterViewInit, OnDestroy {

  categorias:          CategoriaVista[] = [];
  categoriasFiltradas: CategoriaVista[] = [];
  activeCatId:   string | null = null;
  busqueda       = '';
  sidebarAbierto = false;
  cargando       = true;

  private subs     = new Subscription();
  private observer: IntersectionObserver | null = null;
  private revealIo: IntersectionObserver | null = null;

  constructor(
    private productSvc:     ProductService,
    private cotizacionSvc:  CotizacionService,
    private route:          ActivatedRoute,
    private cdr:            ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const sub1 = this.productSvc.getTodosLosProductos().subscribe(productos => {
      this.categorias          = this._buildCategorias(productos);
      this.categoriasFiltradas = this.categorias;
      this.cargando            = false;
      this.cdr.markForCheck();
      setTimeout(() => this._initReveal(), 100);
    });
    this.subs.add(sub1);

    const sub2 = this.route.queryParamMap.subscribe(params => {
      this.busqueda = params.get('q') ?? '';
      this._filtrar();
      this.cdr.markForCheck();
    });
    this.subs.add(sub2);
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.activeCatId = e.target.id;
            this.cdr.markForCheck();
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    setTimeout(() => {
      document.querySelectorAll('[data-cat-section]').forEach(el => this.observer!.observe(el));
    }, 300);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.observer?.disconnect();
    this.revealIo?.disconnect();
  }

  private _buildCategorias(productos: Producto[]): CategoriaVista[] {
    const mapa = new Map<string, CategoriaVista>();
    for (const p of productos) {
      const meta = CAT_META[p.categoriaId] ?? {
        descripcion: `Productos de la categoría ${p.categoriaNombre}.`,
        industrias:  ['Industria general'],
        color:       'cat-morado',
      };
      if (!mapa.has(p.categoriaId)) {
        mapa.set(p.categoriaId, {
          id: p.categoriaId, nombre: p.categoriaNombre,
          descripcionCat: meta.descripcion, industrias: meta.industrias,
          color: meta.color, productos: [],
        });
      }
      mapa.get(p.categoriaId)!.productos.push({
        nombre:      p.titulo,
        serie:       p.serie,
        imagen:      getCatalogImageUrl(p.imagen),
        descripcion: p.descripcionCorta,
        ruta:        p.slug,
      });
    }
    return Array.from(mapa.values()).sort((a, b) =>
      Math.min(...a.productos.map(p => +p.serie)) - Math.min(...b.productos.map(p => +p.serie))
    );
  }

  private _filtrar(): void {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) { this.categoriasFiltradas = this.categorias; return; }
    this.categoriasFiltradas = this.categorias
      .map(cat => ({
        ...cat,
        productos: cat.productos.filter(p =>
          p.nombre.toLowerCase().includes(q) ||
          p.serie.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.productos.length > 0 || cat.nombre.toLowerCase().includes(q));
  }

  scrollToCategory(id: string): void {
    this.sidebarAbierto = false;
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 155, behavior: 'smooth' });
  }

  getCatTitleClass(catId: string): string {
    return CAT_META[catId]?.color ?? 'cat-morado';
  }

  getSerieClass(serie: string): string {
    const n = parseInt(serie.replace(/\D/g, ''), 10);
    if (n >= 1000 && n < 2000) return 'serie-morado';
    if (n >= 2000 && n < 3000) return 'serie-ambar';
    if (n >= 3000 && n < 4000) return 'serie-verde';
    if (n >= 4000 && n < 5000) return 'serie-azul';
    if (n >= 5000 && n < 6000) return 'serie-rojo';
    if (n >= 6000)              return 'serie-gris';
    return 'serie-morado';
  }

  cotizarProducto(producto: ProductoVista, catNombre: string): void {
    this.cotizacionSvc.abrirAlertaCorreo({
      nombre: producto.nombre, serie: producto.serie,
      descripcion: producto.descripcion, categoriaNombre: catNombre,
    });
  }

  private _initReveal(): void {
    this.revealIo?.disconnect();
    this.revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right')
      .forEach(el => this.revealIo!.observe(el));
  }
}
