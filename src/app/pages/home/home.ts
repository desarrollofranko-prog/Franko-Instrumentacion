// ── Importaciones del núcleo de Angular ─────────────────────────────────────

// ChangeDetectionStrategy: permite elegir la estrategia de detección de cambios del componente
// Component: decorador que marca una clase como componente Angular
// AfterViewInit: interfaz de ciclo de vida; su método se ejecuta después de que el DOM del componente está listo
// OnDestroy: interfaz de ciclo de vida; su método se ejecuta cuando Angular destruye el componente
import { ChangeDetectionStrategy, Component, AfterViewInit, OnDestroy } from '@angular/core';

// CommonModule: habilita directivas estructurales como *ngIf y *ngFor en el template
// NgOptimizedImage: directiva de Angular para optimizar imágenes (lazy loading, tamaños, prioridades)
import { CommonModule, NgOptimizedImage } from '@angular/common';

// RouterModule: habilita directivas de navegación como routerLink y routerLinkActive en el template
import { RouterModule } from '@angular/router';

// ── Decorador @Component ─────────────────────────────────────────────────────

@Component({
  selector: 'app-home',              // Nombre del elemento HTML personalizado que representa este componente (<app-home>)
  standalone: true,                  // Componente independiente: no necesita ser declarado en un NgModule
  imports: [CommonModule, RouterModule, NgOptimizedImage], // Módulos disponibles en el template de este componente
  templateUrl: './home.html',        // Ruta al archivo HTML que define la vista del componente
  styleUrl: './home.scss',           // Ruta al archivo SCSS que define los estilos encapsulados del componente
  changeDetection: ChangeDetectionStrategy.OnPush, // Modo de detección eficiente: solo re-renderiza cuando cambia una referencia de entrada o se emite un evento
})

// ── Clase del componente ─────────────────────────────────────────────────────

// Implementa AfterViewInit para ejecutar lógica cuando el DOM ya existe
// Implementa OnDestroy para limpiar temporizadores y observadores al salir de la ruta
export class Home implements AfterViewInit, OnDestroy {

  // ── Estado del carrusel de marcas ─────────────────────────────────────────

  // Índice actual del carrusel: representa cuántas posiciones se ha desplazado desde la primera
  brandIndex = 0;

  // Controla si la transición CSS (animación slide) está activa o desactivada
  // Se desactiva momentáneamente para hacer el "salto invisible" del loop infinito
  brandTransition = true;

  // Bandera que indica que el loop infinito está en proceso de reinicio
  // Evita que el usuario o el timer disparen otro avance mientras se está reseteando
  isResetting = false;

  // Referencia al setInterval del avance automático del carrusel
  // Tipo ReturnType<typeof setInterval> es compatible con Node.js y con el browser
  // Empieza en null porque el timer aún no se ha creado (se crea en ngAfterViewInit)
  private brandTimer:  ReturnType<typeof setInterval>  | null = null;

  // Referencia al primer setTimeout del proceso de reset del loop infinito
  // Se usa para cancelarlo en ngOnDestroy si el componente se destruye antes de que dispare
  private resetTimer1: ReturnType<typeof setTimeout>   | null = null;

  // Referencia al segundo setTimeout del proceso de reset (reactiva la transición CSS tras el salto)
  private resetTimer2: ReturnType<typeof setTimeout>   | null = null;

  // IntersectionObserver que detecta cuándo los elementos con clase .reveal entran al viewport
  // Se inicializa en ngAfterViewInit y se desconecta en ngOnDestroy para evitar memory leaks
  private revealIo:    IntersectionObserver | null = null;

  // IntersectionObserver que detecta cuándo los contadores de estadísticas entran al viewport
  // Una vez que dispara, deja de observar ese elemento (se usa una sola vez por contador)
  private counterIo:   IntersectionObserver | null = null;

  // Ancho en píxeles de cada tarjeta de logo en el carrusel
  // Se usa para calcular el desplazamiento horizontal exacto con translateX
  private readonly BRAND_ITEM_PX = 180;

  // ── Getters calculados ────────────────────────────────────────────────────

  // Calcula el string CSS para desplazar el carrusel al índice actual
  // Multiplica el índice por el ancho de cada item y aplica translateX negativo (desplaza a la izquierda)
  get brandOffset(): string {
    return `translateX(${-(this.brandIndex * this.BRAND_ITEM_PX)}px)`;
  }

  // Calcula el índice del punto (dot) activo en la paginación del carrusel
  // El operador módulo (%) hace que el dot vuelva al inicio cuando brandIndex supera la cantidad de logos reales
  get brandDotIndex(): number {
    return this.brandIndex % this.brandLogos.length;
  }

  // ── Ciclo de vida: ngAfterViewInit ────────────────────────────────────────

  // Angular llama a este método una vez que el DOM del componente y sus hijos están completamente renderizados
  // Es el lugar correcto para interactuar con el DOM real (querySelectorAll, IntersectionObserver, etc.)
  ngAfterViewInit() {

    // Selecciona todos los elementos del DOM que deben animarse al entrar al viewport
    // Array.from convierte el NodeList de querySelectorAll en un array nativo de JavaScript
    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right')
    );

    // Crea un IntersectionObserver para detectar cuándo los elementos de reveal son visibles
    this.revealIo = new IntersectionObserver(
      // Callback que se ejecuta cada vez que algún elemento entra o sale del viewport
      (entries) => {
        // Itera sobre cada elemento observado que cambió su estado de visibilidad
        entries.forEach((entry) => {
          // Si el elemento está intersectando (visible en el viewport), añade la clase CSS que dispara la animación
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');    // CSS de entrada: fade-in + slide
          } else {
            entry.target.classList.remove('revealed'); // Al salir del viewport, resetea la animación para que vuelva a dispararse al entrar de nuevo
          }
        });
      },
      // Opciones del observer:
      // threshold: 0.12 → dispara cuando al menos el 12% del elemento es visible
      // rootMargin: '0px 0px -55px 0px' → reduce el área de detección 55px por abajo (el elemento debe estar un poco más adentro de la pantalla)
      { threshold: 0.12, rootMargin: '0px 0px -55px 0px' }
    );

    // Registra todos los elementos de reveal en el observer para que sean vigilados
    revealEls.forEach((el) => this.revealIo!.observe(el));

    // Animated counters — fire once when stat section enters viewport
    // Selecciona todos los elementos de la sección de estadísticas que contienen el número animado
    const counterEls = Array.from(document.querySelectorAll<HTMLElement>('.stat-count'));

    // Solo crea el observer si existen elementos de contador en el DOM
    if (counterEls.length) {
      // Crea un IntersectionObserver separado exclusivamente para los contadores
      this.counterIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Cuando el contador entra al viewport, dispara la animación del número
            if (entry.isIntersecting) {
              this.animateCounter(entry.target as HTMLElement); // Inicia la cuenta animada del 0 al valor objetivo
              this.counterIo!.unobserve(entry.target);         // Deja de observar este elemento (la animación solo ocurre una vez)
            }
          });
        },
        // threshold: 0.4 → el contador debe estar al menos 40% visible antes de animar
        { threshold: 0.4 }
      );

      // Registra cada elemento de contador en el observer
      counterEls.forEach((el) => this.counterIo!.observe(el));
    }

    // Inicia el timer de avance automático del carrusel
    this.brandTimer = setInterval(() => this.advanceBrand(1), 2000);
  }

  // ── Animación de contadores numéricos ────────────────────────────────────

  // Anima un elemento HTML del número 0 hasta su valor objetivo usando easing cúbico
  private animateCounter(el: HTMLElement) {

    // Lee el atributo data-target del elemento para obtener el número final
    // parseInt convierte el string a entero en base 10; ?? '0' es el valor por defecto si el atributo no existe
    const target = parseInt(el.getAttribute('data-target') ?? '0', 10);

    // Duración total de la animación en milisegundos
    const duration = 1800;

    // Captura el timestamp de inicio usando la API de alta precisión del navegador
    const start = performance.now();

    // Función recursiva que se llama en cada frame del navegador (requestAnimationFrame)
    const step = (now: number) => {

      // Calcula el tiempo transcurrido desde el inicio de la animación
      const elapsed = now - start;

      // Calcula el progreso lineal de 0 a 1 (Math.min evita que supere 1 si la animación tarda más)
      const progress = Math.min(elapsed / duration, 1);

      // Aplica easing ease-out cúbico: comienza rápido y desacelera al final
      // Fórmula: 1 - (1 - progress)^3 — valores de 0 a 1 con curva de desaceleración
      const eased = 1 - Math.pow(1 - progress, 3);

      // Actualiza el texto del elemento con el valor actual interpolado (redondeado hacia abajo)
      el.textContent = String(Math.floor(eased * target));

      // Si la animación no ha terminado, solicita el siguiente frame al navegador
      if (progress < 1) requestAnimationFrame(step);
      // Si ya terminó, fija el valor exacto final (evita errores de redondeo)
      else el.textContent = String(target);
    };

    // Arranca la animación solicitando el primer frame al navegador
    requestAnimationFrame(step);
  }

  // ── Ciclo de vida: ngOnDestroy ────────────────────────────────────────────

  // Angular llama a este método justo antes de destruir el componente (por ejemplo, al navegar a otra ruta)
  // Aquí se liberan todos los recursos para evitar memory leaks
  ngOnDestroy() {
    if (this.brandTimer)  clearInterval(this.brandTimer);  // Cancela el avance automático del carrusel
    if (this.resetTimer1) clearTimeout(this.resetTimer1);  // Cancela el primer timeout de reset del loop (si estaba pendiente)
    if (this.resetTimer2) clearTimeout(this.resetTimer2);  // Cancela el segundo timeout de reset (si estaba pendiente)
    this.revealIo?.disconnect();   // Desconecta el observer de reveal; deja de vigilar todos sus elementos
    this.counterIo?.disconnect();  // Desconecta el observer de contadores; deja de vigilar todos sus elementos
  }

  // ── Controles públicos del carrusel ──────────────────────────────────────

  // Avanza el carrusel una posición hacia adelante (botón "siguiente")
  nextBrand() {
    this.advanceBrand(1);   // Incrementa el índice en 1
    this.restartTimer();    // Reinicia el timer automático para que no salte justo después de la interacción manual
  }

  // Retrocede el carrusel una posición hacia atrás (botón "anterior")
  prevBrand() {
    this.advanceBrand(-1);  // Decrementa el índice en 1
    this.restartTimer();    // Reinicia el timer automático
  }

  // Salta directamente a un logo específico (click en un dot de paginación)
  goToBrand(i: number) {
    this.brandIndex = i;  // Establece el índice directamente al valor del dot clickeado
    this.restartTimer();  // Reinicia el timer automático
  }

  // ── Lógica del loop infinito del carrusel ────────────────────────────────

  // Avanza o retrocede el carrusel con manejo de loop infinito sin parpadeo
  // dir: 1 = adelante, -1 = atrás
  private advanceBrand(dir: 1 | -1) {

    // Si ya está en proceso de reset del loop, ignora cualquier nuevo avance para evitar saltos dobles
    if (this.isResetting) return;

    // Total de logos reales (sin el duplicado del array brandLogosLoop)
    const total = this.brandLogos.length;

    if (dir === 1) {
      // Avance hacia adelante: incrementa el índice
      this.brandIndex++;

      // Si llegamos al final del array real (índice === total), iniciamos el reset del loop infinito
      if (this.brandIndex === total) {
        this.isResetting = true; // Bloquea nuevos avances mientras ocurre el reset

        // Espera a que termine la animación CSS de transición (560ms ≈ duración del transition en SCSS)
        // antes de hacer el salto invisible
        this.resetTimer1 = setTimeout(() => {
          this.brandTransition = false; // Desactiva la transición CSS para que el salto sea instantáneo (invisible)
          this.brandIndex = 0;          // Salta al primer elemento (visualmente idéntico al que estaba mostrando gracias al array duplicado)

          // Espera 50ms (un tick de repintado del navegador) antes de reactivar la transición
          // Si se reactivara en el mismo tick, el navegador aplicaría la animación al salto también
          this.resetTimer2 = setTimeout(() => {
            this.brandTransition = true;  // Reactiva la animación CSS para los próximos avances
            this.isResetting = false;     // Desbloquea los avances del carrusel
          }, 50);
        }, 360); // Duración en ms que coincide con la transición CSS del carrusel
      }

    } else {
      // Avance hacia atrás: necesita manejar el caso de estar en el primer elemento

      if (this.brandIndex <= 0) {
        // Estamos en la primera posición; hay que saltar al final del array duplicado de forma invisible
        this.isResetting = true;          // Bloquea nuevos avances
        this.brandTransition = false;     // Desactiva transición CSS para el salto invisible
        this.brandIndex = total;          // Salta al "clon" del último elemento al final del array duplicado

        // Espera un tick de repintado (50ms) para que el navegador aplique el salto sin animación
        this.resetTimer1 = setTimeout(() => {
          this.brandTransition = true;    // Reactiva la animación CSS
          this.brandIndex--;              // Retrocede uno con animación visible (del clon al penúltimo real)

          // Espera a que termine la animación de retroceso antes de desbloquear
          this.resetTimer2 = setTimeout(() => { this.isResetting = false; }, 360);
        }, 50);

      } else {
        // Retroceso normal: simplemente decrementa el índice (hay elementos antes del actual)
        this.brandIndex--;
      }
    }
  }

  // ── Timer automático del carrusel ─────────────────────────────────────────

  // Cancela el timer existente y crea uno nuevo, reiniciando el contador de 2.6 segundos
  // Se llama después de cualquier interacción manual para que no salte inmediatamente después
  private restartTimer() {
    if (this.brandTimer) clearInterval(this.brandTimer);
    this.brandTimer = setInterval(() => this.advanceBrand(1), 2000);
  }

  // ── Datos estáticos del componente ────────────────────────────────────────

  // Array de estadísticas de la empresa que se muestran en la sección de números
  // value: número final al que llega el contador animado
  // suffix: texto que se añade después del número ('+', 'k', etc.)
  // label: título principal del stat
  // sub: descripción secundaria debajo del label
  stats = [
    { value: 35,  suffix: '+', label: 'Años de experiencia', sub: 'Pioneros desde 1990' },
    { value: 30,  suffix: '+', label: 'Líneas de producto',  sub: 'Catálogo especializado' },
    { value: 4,   suffix: '',  label: 'Industrias atendidas', sub: 'Petroquímica, Biogás y más' },
  ];

  // Array de documentos técnicos descargables mostrados en la sección de recursos
  // title: nombre del documento, type: descripción del formato, icon: clase Bootstrap Icons, url: ruta al PDF
  techDocs = [
    { title: 'Certificación ISO 9001',    type: 'PDF · Certificado oficial', icon: 'bi bi-patch-check', url: 'https://franko.com.mx/pdfs/certIso.pdf' },
    { title: 'Clasificación de Gases IEC', type: 'PDF · Referencia técnica',  icon: 'bi bi-file-earmark-text', url: 'https://franko.com.mx/pdfs/mesg-of-gas.pdf' },
    { title: 'Tabla de Resistencia a la Corrosión', type: 'PDF · Referencia de materiales', icon: 'bi bi-table', url: 'https://franko.com.mx/pdfs/MetalCorrosion.pdf' },
  ];

  // Array de características/ventajas de fabricación mostradas en la sección de manufactura
  // icon: clase de Bootstrap Icons, title: nombre de la característica, desc: descripción breve
  features = [
    { icon: 'bi bi-tools', title: 'Precisión CNC', desc: 'Mecanizado de alta exactitud en aceros y aleaciones especiales' },
    { icon: 'bi bi-patch-check', title: 'Certificación ISO 9001', desc: 'Calidad verificada en cada etapa del proceso de fabricación' },
    { icon: 'bi bi-shield-check', title: '+35 Años de Experiencia', desc: 'Pioneros en seguridad industrial en México desde 1990' },
  ];

  // Array de productos destacados mostrados en la sección de catálogo de la home
  // name: nombre del producto, serie: identificador de serie, image: ruta a la imagen WebP optimizada
  // link: ruta de Angular Router al detalle del producto, rating: puntuación de 1 a 5, badge: etiqueta especial (vacía si no aplica)
  products = [
    { name: 'Válvula Presión/Vacío',        serie: 'Serie 1000', image: 'assets/images/productos/1000.webp', link: '/productos/1000', rating: 4, badge: 'Más Vendido' },
    { name: 'Arrestador de Deflagración',  serie: 'Serie 2000', image: 'assets/images/productos/2000.webp', link: '/productos/2000', rating: 4, badge: '' },
    { name: 'Arrestador de Detonación',    serie: 'Serie 2010', image: 'assets/images/productos/2010.webp', link: '/productos/2010', rating: 4, badge: '' },
    { name: 'Arr. con Válvula P/V Integrada', serie: 'Serie 2035', image: 'assets/images/productos/2035.webp', link: '/productos/2035', rating: 4, badge: '' },
    { name: 'Cámara de Espuma',            serie: 'Serie 2200', image: 'assets/images/productos/2200.webp', link: '/productos/2200', rating: 5, badge: '' },
    { name: 'Indicador Magnético',         serie: 'Serie 4200', image: 'assets/images/productos/4200.webp', link: '/productos/4200', rating: 4, badge: '' },
    { name: 'Ind. Cristal Plano',          serie: 'Serie 4040', image: 'assets/images/productos/4040.webp', link: '/productos/4040', rating: 4, badge: '' },
    { name: 'Ventila con Brazo',           serie: 'Serie 3015', image: 'assets/images/productos/3015.webp', link: '/productos/3015', rating: 5, badge: '' },
  ];

  // Array de logos de clientes/marcas que se muestran en el carrusel de clientes
  // name: nombre para atributo alt e identificación interna, src: ruta al archivo de imagen (PNG o SVG)
  brandLogos = [
    { name: 'Pemex',     src: 'assets/images/marcas/logo-pemex.png' },
    { name: 'Shell',     src: 'assets/images/marcas/logo-shell.svg' },
    { name: 'BASF',      src: 'assets/images/marcas/logo-basf.svg' },
    { name: 'Heineken',  src: 'assets/images/marcas/logo-heineken.svg' },
    { name: 'FEMSA',     src: 'assets/images/marcas/logo-femsa.svg' },
    { name: 'Unilever',  src: 'assets/images/marcas/logo-unilever.svg' },
    { name: 'P&G',       src: 'assets/images/marcas/logo-proctergamble.png' },
    { name: 'Honeywell', src: 'assets/images/marcas/logo-honeywell.svg' },
    { name: 'Cuervo',    src: 'assets/images/marcas/logo-cuervo.png' },
  ];

  // Duplicated for seamless infinite loop (first copy visible + second copy as buffer)
  // El spread operator (...) crea una nueva referencia de array; no muta brandLogos original
  // El array duplicado permite que el carrusel "salte" del último al primero sin parpadeo:
  // visualmente el último logo del primer bloque y el primero del segundo bloque se ven igual
  brandLogosLoop = [...this.brandLogos, ...this.brandLogos];

  // Array de industrias mostradas en la sección de sectores atendidos
  // title: nombre del sector, tagline: slogan corto, desc: descripción detallada
  // image: imagen representativa del sector, link: ruta de Angular Router a la guía de esa industria
  industries = [
    {
      title: 'Destilerías y Tequileras',
      tagline: 'Protege tu producción. Cumple con la norma.',
      desc: 'Válvulas y arrestadores certificados para vapores de alcohol: sin mermas, sin riesgos de ignición y sin paros no programados que afecten tu operación.',
      image: 'assets/images/Imagenes/tn-i-distilery.webp',
      link: '/guia-de-productos-destilerias'
    },
    {
      title: 'Industria Petroquímica',
      tagline: 'Máxima protección en procesos de alto riesgo.',
      desc: 'Equipos certificados ISO 9001 para alivio de presión y prevención de explosiones — diseñados para resistir las condiciones más severas de la industria.',
      image: 'assets/images/Imagenes/tn-i-Petro.webp',
      link: '/guia-de-productos-petroquimicas'
    },
    {
      title: 'Plantas de Biogás',
      tagline: 'Más energía, menos riesgo.',
      desc: 'Ventilación operacional y de emergencia con arrestadores de flama especializados para digestores y redes de biogás. Seguridad comprobada en campo.',
      image: 'assets/images/Imagenes/tn-i-biogas.webp',
      link: '/guia-de-productos-biogas'
    },
    {
      title: 'Refinerías',
      tagline: 'Reduce mermas. Opera sin interrupciones.',
      desc: 'Equipos de conservación y alivio que protegen tu inversión, prolongan la vida útil de tu planta y minimizan pérdidas de productos volátiles.',
      image: 'assets/images/Imagenes/tn-i-refinery.webp',
      link: '/guia-de-productos-refinerias'
    },
  ];

  // Array de testimonios de clientes mostrados en la sección social proof
  // texto: cita textual del cliente, autor: nombre completo con prefijo profesional
  // cargo: puesto y empresa del cliente (aporta credibilidad y contexto industrial)
  testimonios = [
    {
      texto: 'Llevamos más de 10 años trabajando con Franko para la protección de nuestros tanques de almacenamiento. Sus válvulas Serie 1000 nunca nos han fallado y el soporte técnico es incomparable.',
      autor: 'Ing. Roberto Salinas',
      cargo: 'Jefe de Mantenimiento · Destilería Los Valles, Jalisco',
    },
    {
      texto: 'Los arrestadores de flama certificados ISO 16852 nos dieron la tranquilidad que necesitábamos para cumplir con las auditorías de proceso. Producto de calidad mundial, hecho en México.',
      autor: 'Ing. Carmen Fuentes',
      cargo: 'Gerente de Seguridad Industrial · Planta Petroquímica, Veracruz',
    },
    {
      texto: 'Cotizamos con tres proveedores y Franko fue el único que nos ofreció certificados de material, calibración individual y respuesta técnica en menos de 24 horas. La diferencia fue clara.',
      autor: 'M. en I. Alejandro Torres',
      cargo: 'Director de Proyectos · Refinería del Pacífico',
    },
  ];

  // ── Sección de preguntas frecuentes (FAQ) ────────────────────────────────

  // Almacena el índice de la pregunta actualmente abierta; null significa que ninguna está expandida
  // El tipo union (number | null) permite representar ambos estados sin flags booleanos adicionales
  faqAbierto: number | null = null;

  // Alterna el estado abierto/cerrado de una pregunta del FAQ
  // Si la pregunta clickeada ya está abierta (faqAbierto === i), la cierra estableciendo null
  // Si estaba cerrada o era otra pregunta, la abre guardando su índice
  // Este patrón de "accordion" garantiza que solo una pregunta esté abierta a la vez
  toggleFaq(i: number) {
    this.faqAbierto = this.faqAbierto === i ? null : i;
  }

  // Array de preguntas frecuentes con sus respuestas
  // pregunta: texto de la pregunta visible en el encabezado del accordion
  // respuesta: texto completo visible al expandir la pregunta
  faqs = [
    {
      pregunta: '¿Cuánto tiempo tarda en llegar un pedido?',
      respuesta: 'Para productos en existencia, el tiempo de entrega es de 3 a 5 días hábiles en Ciudad de México y área metropolitana. Para el interior de la República, de 5 a 10 días hábiles vía paquetería. Productos especiales o con configuraciones fuera de estándar pueden requerir de 3 a 6 semanas de fabricación.',
    },
    {
      pregunta: '¿Sus productos cuentan con certificación ISO 9001?',
      respuesta: 'Sí. Franko está certificado bajo la norma ISO 9001:2015 en diseño, fabricación y pruebas de equipos de control de presión, medición de nivel y seguridad industrial. Cada producto sale acompañado de su hoja de datos y, según el tipo, de su certificado de calibración individual.',
    },
    {
      pregunta: '¿Puedo solicitar un producto con materiales o dimensiones especiales?',
      respuesta: 'Absolutamente. Nuestro departamento de ingeniería puede adaptar materiales (aceros exóticos como Hastelloy, Inconel o Duplex), configuraciones de brida, sellados y rangos de operación a las especificaciones exactas de su proceso. Escríbenos con sus requerimientos y le cotizamos en 24 horas.',
    },
    {
      pregunta: '¿Ofrecen servicio de campo o instalación?',
      respuesta: 'Sí, contamos con ingenieros de campo disponibles para instalación, puesta en marcha, calibración y mantenimiento preventivo. También ofrecemos capacitación técnica en sitio para el personal de operación y mantenimiento de su planta.',
    },
    {
      pregunta: '¿Cuáles normas internacionales cumplen sus productos?',
      respuesta: 'Nuestros productos están diseñados y fabricados bajo API 2000, ISO 28300, ISO 16852, EN 12874, NFPA 11, NFPA 30, API 650 y ASME B40.100, según la línea de producto. Toda la documentación de cumplimiento está disponible bajo solicitud.',
    },
  ];
}
