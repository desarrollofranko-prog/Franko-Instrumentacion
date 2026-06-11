// ── Componente de navegación principal (header fijo) ─────────────────────────
import { ChangeDetectionStrategy, Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, take, debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Producto } from '../../models/producto.model';
import { ImagenUrlPipe } from '../../pipes/imagen-url.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImagenUrlPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, OnDestroy {

  isScrolled = false;
  activeMenu: string | null = null;
  catSidebarOpen = false;
  activeCat: string | null = null;
  searchQuery = '';
  mobileMenuOpen = false;
  mobileExpandedSection: string | null = null;
  mobileExpandedCat: string | null = null;
  sugerencias: Producto[] = [];
  mostrarSugerencias = false;
  sugerenciaActiva = -1;

  private originalBodyOverflow: string | null = null;
  private todosLosProductos: Producto[] = [];
  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  industriasNav = [
    { name: 'Destilerías', img: 'assets/imagenes Industrias/tn-i-distilery.webp', link: '/guia-de-productos-destilerias' },
    { name: 'Química y Petroquímica', img: 'assets/imagenes Industrias/tn-i-Petro.webp', link: '/guia-de-productos-petroquimicas' },
    { name: 'Biogás', img: 'assets/imagenes Industrias/tn-i-biogas.webp', link: '/guia-de-productos-biogas' },
    { name: 'Refinerías', img: 'assets/imagenes Industrias/tn-i-refinery.webp', link: '/guia-de-productos-refinerias' },
  ];

  categories = [
    {
      name: 'Válvulas de Alivio',
      fragment: 'valvulas-de-alivio',
      items: [
        '1000 - Alivio Presión/Vacío',
        '1010 - Presión Dirigida/Vacío',
        '1030 - Alivio de Vacío',
        '1040 - Alivio de Presión',
        '1080 - Tank Blanketing baja presión',
        '3000 - Escotilla de Medición',
      ],
    },
    {
      name: 'Arrestadores de Flama',
      fragment: 'arrestadores-de-flama',
      items: [
        '2000 - Arr. de Deflagración',
        '2010 - Arr. de Detonación',
        '2020 - Flame Check',
        '2030 - Arr. Compacto',
        '2035 - Arr. con Válvula P/V Integrada',
        '3010 - Ventila Baja Presión',
        '3015 - Ventila con Brazo',
        '3020 - Ventila Alta Presión',
        '3030 - Ventila Presión/Vacío',
      ],
    },
    {
      name: 'Formadores de Espuma',
      fragment: 'formadores-de-espuma',
      items: [
        '2200 - Cámara de Espuma',
        '2210 - Formador de Espuma',
      ],
    },
    {
      name: 'Control y Medición',
      fragment: 'control-y-medicion',
      items: [
        '4000 - Ind. Tubular Acorazado',
        '4005 - Ind. Tubular',
        '4010 - Regleta de Medición',
        '4040 - Ind. Cristal Plano',
        '4200 - Ind. Magnético',
        '5010 - Trans. Ultrasónico',
        '5020 - Switch',
      ],
    },
    {
      name: 'Cristales y Visores',
      fragment: 'cristales-visores',
      items: [
        '6010 - Mirilla Tubular 360°',
        '6020 - Visor a Proceso',
      ],
    },
  ];

  constructor(
    public router: Router,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Precarga catálogo para autocompletado
    const sub1 = this.productService.getTodosLosProductos().subscribe(productos => {
      this.todosLosProductos = productos;
      this.cdr.markForCheck();
    });
    this.subs.add(sub1);

    // Debounce 200ms en búsqueda
    const sub2 = this.searchSubject.pipe(debounceTime(200)).subscribe(q => {
      this._filtrarSugerencias(q);
    });
    this.subs.add(sub2);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  buscarSugerencias(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (q.length === 0) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      this.sugerenciaActiva = -1;
      this.cdr.markForCheck();
      return;
    }
    this.searchSubject.next(q);
  }

  private _filtrarSugerencias(q: string): void {
    this.sugerencias = this.todosLosProductos
      .filter(p =>
        p.titulo.toLowerCase().includes(q) ||
        p.serie.toLowerCase().includes(q) ||
        p.categoriaNombre.toLowerCase().includes(q) ||
        p.descripcionCorta.toLowerCase().includes(q)
      )
      .slice(0, 7);
    this.mostrarSugerencias = true;
    this.sugerenciaActiva = -1;
    this.cdr.markForCheck();
  }

  irAProducto(ruta: string): void {
    this.searchQuery = '';
    this.sugerencias = [];
    this.mostrarSugerencias = false;
    this.closeAll();
    this.router.navigate(['/productos', ruta]);
  }

  cerrarSugerencias(): void {
    setTimeout(() => {
      this.mostrarSugerencias = false;
      this.sugerenciaActiva = -1;
      this.cdr.markForCheck();
    }, 150);
  }

  navegarSugerencia(dir: 1 | -1): void {
    if (!this.mostrarSugerencias || this.sugerencias.length === 0) return;
    this.sugerenciaActiva = Math.max(-1, Math.min(this.sugerencias.length - 1, this.sugerenciaActiva + dir));
  }

  seleccionarActiva(event: Event): void {
    event.preventDefault();
    if (this.sugerenciaActiva >= 0 && this.sugerencias[this.sugerenciaActiva]) {
      this.irAProducto(this.sugerencias[this.sugerenciaActiva].slug);
    } else {
      this.doSearch();
    }
  }

  doSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.closeAll();
    this.router.navigate(['/productos'], { queryParams: { q } });
  }

  get isProductosActive(): boolean { return this.router.url.startsWith('/productos'); }
  get isIndustriasActive(): boolean { return this.router.url.startsWith('/guia-de-productos'); }

  @HostListener('window:scroll')
  onScroll() { this.isScrolled = window.scrollY > 10; this.cdr.markForCheck(); }

  openMenu(name: string) { this.activeMenu = name; }
  closeMenu() { this.activeMenu = null; }
  toggleMenu(name: string) { this.activeMenu = this.activeMenu === name ? null : name; }

  openCatSidebar() { this.catSidebarOpen = true; this.setBodyScrollLock(true); }
  closeCatSidebar() { this.catSidebarOpen = false; this.activeCat = null; this.setBodyScrollLock(false); }
  toggleCatSidebar() { this.catSidebarOpen ? this.closeCatSidebar() : this.openCatSidebar(); }
  toggleCat(name: string) { this.activeCat = this.activeCat === name ? null : name; }

  navigateToCategory(fragment: string): void {
    this.closeCatSidebar();
    const currentPath = this.router.url.split('?')[0].split('#')[0];
    if (currentPath === '/productos') { this.scrollToElement(fragment); return; }
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), take(1))
      .subscribe(() => setTimeout(() => this.scrollToElement(fragment), 300));
    this.router.navigate(['/productos']);
  }

  private scrollToElement(id: string): void {
    const el = document.getElementById(id);
    if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 110; window.scrollTo({ top, behavior: 'smooth' }); }
  }

  closeCatMobile() { this.closeAll(); }

  toggleMobileMenu() {
    if (this.mobileMenuOpen) { this.closeMobileMenu(); }
    else { this.activeMenu = null; this.catSidebarOpen = false; this.activeCat = null; this.mobileMenuOpen = true; this.setBodyScrollLock(true); }
  }

  closeMobileMenu() { this.mobileMenuOpen = false; this.mobileExpandedSection = null; this.mobileExpandedCat = null; this.setBodyScrollLock(false); }
  toggleMobileSection(section: string) { this.mobileExpandedSection = this.mobileExpandedSection === section ? null : section; this.mobileExpandedCat = null; }
  toggleMobileCat(name: string) { this.mobileExpandedCat = this.mobileExpandedCat === name ? null : name; }
  getCatItemRoute(item: string): string { return '/productos/' + item.split(' - ')[0].trim(); }

  private setBodyScrollLock(lock: boolean) {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (lock) { this.originalBodyOverflow = body.style.overflow || null; body.style.overflow = 'hidden'; }
    else { body.style.overflow = this.originalBodyOverflow || ''; this.originalBodyOverflow = null; }
  }

  closeAll() { this.activeMenu = null; this.catSidebarOpen = false; this.activeCat = null; this.closeMobileMenu(); }
}
