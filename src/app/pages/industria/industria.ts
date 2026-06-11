// ── Página de guía de productos por industria ────────────────────────────────
// Un solo componente reutilizable sirve cuatro rutas de industria:
//   /guia-de-productos-destilerias
//   /guia-de-productos-petroquimicas
//   /guia-de-productos-biogas
//   /guia-de-productos-refinerias
// El componente lee la URL activa en ngOnInit y selecciona el contenido correspondiente
// del mapa estático this.data. Esto evita duplicar código HTML para cada industria.

// ChangeDetectionStrategy: para elegir la estrategia de renderizado del componente
// ChangeDetectorRef: referencia manual al detector de cambios (necesario con OnPush)
// Component: decorador principal de Angular
// OnInit: interfaz de ciclo de vida — ngOnInit() lee la URL y carga los datos de la industria
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

// CommonModule: habilita *ngFor, *ngIf, *ngSwitch, etc. en el template
import { CommonModule } from '@angular/common';

// RouterModule: habilita routerLink para los links del breadcrumb y las tarjetas de productos
// ActivatedRoute: servicio que permite acceder a los segmentos de la URL activa
import { RouterModule, ActivatedRoute } from '@angular/router';

// IndustriaData: interfaz que describe la estructura completa de los datos de una industria
interface IndustriaData {
  titulo: string;          // Nombre de la industria (ej. "Destilerías y Tequileras")
  subtitulo: string;       // Tagline corto (ej. "Protege tu producción. Cumple con la norma.")
  descripcion: string;     // Párrafo descriptivo largo del contexto industrial
  imagen: string;          // Ruta a la imagen del hero de la industria
  imagenDestacada: string; // Ruta a la imagen de mayor resolución en la sección de productos
  color: string;           // Color hexadecimal temático de la industria (usado en inline styles del template)
  productos: {             // Array de productos recomendados para esta industria
    serie: string;         // Código de serie del producto (ej. "Serie 1000")
    nombre: string;        // Nombre del producto
    descripcion: string;   // Descripción corta del producto en contexto de la industria
    ruta: string;          // Slug para la URL de detalle del producto (ej. "1000")
    img: string;           // Ruta a la imagen del producto
  }[];
  desafios: string[];      // Lista de desafíos técnicos que enfrenta esta industria
  soluciones: string[];    // Lista de soluciones que ofrece Franko para esos desafíos
  normas: string[];        // Normas y estándares que aplican a esta industria
}

// @Component: configura la metadata del componente Industria
@Component({
  selector: 'app-industria',       // Tag HTML del componente (usado por el router)
  standalone: true,                 // No necesita NgModule
  imports: [CommonModule, RouterModule], // Módulos necesarios para el template
  templateUrl: './industria.html',  // HTML: hero, descripción, desafíos/soluciones, productos y CTA
  styleUrl: './industria.scss',     // SCSS encapsulado con variable CSS --ind-color para theming por industria
  changeDetection: ChangeDetectionStrategy.OnPush, // Solo re-renderiza cuando cdr.markForCheck() es llamado
})
export class Industria implements OnInit {
  // Datos de la industria actualmente mostrada — null antes de que ngOnInit lea la URL
  industria: IndustriaData | null = null;

  // Slug de la URL activa (ej. "guia-de-productos-destilerias")
  // Se usa para indexar el mapa this.data y para el breadcrumb del template
  slug = '';

  // ── Mapa de datos por industria ─────────────────────────────────────────
  // Record<string, IndustriaData>: mapa donde la clave es el slug de la URL y el valor son los datos
  // Este mapa permite que un único componente sirva múltiples rutas sin duplicar código
  private data: Record<string, IndustriaData> = {
    'guia-de-productos-destilerias': {
      titulo: 'Destilerías y Tequileras',
      subtitulo: 'Protege tu producción. Cumple con la norma.',
      descripcion: 'Las destilerías y tequileras trabajan con vapores de alcohol altamente inflamables y explosivos. La seguridad de proceso no es opcional: requiere equipos certificados que prevengan incendios, controlen la presión y cumplan con regulaciones como NOM-006-SCFI. Franko ha acompañado a los principales productores de México durante más de 35 años.',
      imagen: 'assets/images/Imagenes/tn-i-distilery.webp',
      imagenDestacada: 'assets/images/Industries/distilery.webp',
      color: '#c8102e',
      productos: [
        { serie: 'Serie 1000', nombre: 'Alivio de Presión / Vacío',        descripcion: 'Controla sobrepresión y vacío en tanques de almacenamiento de alcohol y destilados.',        ruta: '1000', img: 'assets/images/productos/1000.webp' },
        { serie: 'Serie 2000', nombre: 'Arrestador de Deflagración',        descripcion: 'Impide la propagación de llama en venteos de tanques con vapores de etanol.',                  ruta: '2000', img: 'assets/images/productos/2000.webp' },
        { serie: 'Serie 2010', nombre: 'Arrestador de Detonación',          descripcion: 'Arrestador de flama bidireccional para explosiones estables e inestables.',                   ruta: '2010', img: 'assets/images/productos/2010.webp' },
        { serie: 'Serie 2020', nombre: 'Flame Check',                       descripcion: 'Arrestador tipo check para tuberías de proceso en destilerías.',                               ruta: '2020', img: 'assets/images/productos/2020.webp' },
        { serie: 'Serie 2030', nombre: 'Arrestador Compacto',               descripcion: 'Solución compacta para venteos atmosféricos en líneas de pequeño diámetro.',                  ruta: '2030', img: 'assets/images/productos/2030.webp' },
        { serie: 'Serie 3010', nombre: 'Ventila de Emergencia BP',          descripcion: 'Alivio de gran volumen en baja presión ante situaciones de emergencia.',                      ruta: '3010', img: 'assets/images/productos/3010.webp' },
        { serie: 'Serie 2200', nombre: 'Cámara de Espuma',                  descripcion: 'Sistema contra incendio para tanques de almacenamiento de alcohol.',                         ruta: '2200', img: 'assets/images/productos/2200.webp' },
        { serie: 'Serie 3000', nombre: 'Escotilla de Medición',             descripcion: 'Permite acceder al tanque para tomar muestras del contenido.',                                ruta: '3000', img: 'assets/images/productos/3000.webp' },
      ],
      desafios: [
        'Vapores de etanol con alta presión de vapor y riesgo de ignición',
        'Presiones operativas variables en tanques de fermentación y destilación',
        'Regulaciones NOM-006-SCFI y normas NFPA de prevención de incendios',
        'Corrosión acelerada por alcoholes y subproductos de fermentación',
      ],
      soluciones: [
        'Válvulas P/V certificadas API 2000 para control de vapores de alcohol',
        'Arrestadores de flama en línea e in-line para tuberías de proceso',
        'Sistemas de espuma NFPA 11 para protección de tanques de almacenamiento',
        'Ventilas de emergencia de alta capacidad como protección secundaria',
      ],
      normas: ['API 2000', 'ISO 28300', 'NFPA 30', 'ISO 16852', 'NFPA 11', 'ISO 9001:2015'],
    },
    'guia-de-productos-petroquimicas': {
      titulo: 'Industria Petroquímica y Química',
      subtitulo: 'Máxima protección en procesos de alto riesgo.',
      descripcion: 'La industria petroquímica y química opera con materiales peligrosos, presiones extremas y condiciones corrosivas que exigen el más alto nivel de ingeniería de seguridad. Cada falla puede significar pérdidas millonarias y riesgos para el personal. Franko diseña y fabrica equipos que cumplen con las normas internacionales más exigentes.',
      imagen: 'assets/images/Imagenes/tn-i-Petro.webp',
      imagenDestacada: 'assets/images/Industries/petrochem.webp',
      color: '#1d4ed8',
      productos: [
        { serie: 'Serie 1000', nombre: 'Alivio de Presión / Vacío',         descripcion: 'Alivia la presión o el vacío dentro de un tanque de almacenamiento de líquidos.',           ruta: '1000', img: 'assets/images/productos/1000.webp' },
        { serie: 'Serie 1040', nombre: 'Válvula de Alivio de Presión',       descripcion: 'Válvula para aliviar únicamente la sobrepresión en tanques de proceso.',                     ruta: '1040', img: 'assets/images/productos/1040.webp' },
        { serie: 'Serie 2000', nombre: 'Arrestador de Deflagración',         descripcion: 'Arrestador de flama para aplicaciones fin-de-línea y en-línea.',                             ruta: '2000', img: 'assets/images/productos/2000.webp' },
        { serie: 'Serie 2010', nombre: 'Arrestador de Detonación',           descripcion: 'Arrestador de flama bidireccional para explosiones estables e inestables.',                  ruta: '2010', img: 'assets/images/productos/2010.webp' },
        { serie: 'Serie 2035', nombre: 'Arr. con Válvula P/V Integrada',     descripcion: 'Similar a la serie 2030, con válvula de alivio para presión y vacío integrada.',             ruta: '2035', img: 'assets/images/productos/2035.webp' },
        { serie: 'Serie 4200', nombre: 'Indicador Magnético',                descripcion: 'Indicador de nivel magnético de alta precisión para tanques reactores.',                     ruta: '4200', img: 'assets/images/productos/4200.webp' },
        { serie: 'Serie 5010', nombre: 'Transmisor Ultrasónico',             descripcion: 'Medición de nivel a través de frecuencias ultrasónicas, para líquidos o sólidos.',           ruta: '5010', img: 'assets/images/productos/5010.webp' },
        { serie: 'Serie 4040', nombre: 'Indicador Cristal Plano',            descripcion: 'Indicador de nivel reflex tipo cristal plano para fluidos de proceso.',                      ruta: '4040', img: 'assets/images/productos/4040.webp' },
      ],
      desafios: [
        'Manejo de hidrocarburos, solventes y gases a alta presión y temperatura',
        'Riesgo de deflagración y detonación en líneas de proceso',
        'Requisitos de trazabilidad de materiales y certificación de calidad',
        'Condiciones corrosivas con ácidos, bases y productos químicos agresivos',
      ],
      soluciones: [
        'Válvulas de alivio en materiales especiales: inox 316, Hastelloy, polipropileno',
        'Arrestadores de flama certificados ISO 16852 para líneas a presión',
        'Indicadores de nivel de alta presión para tanques reactores',
        'Sistemas de medición integrables con DCS y SCADA',
      ],
      normas: ['API 2000', 'ISO 16852', 'NFPA 30', 'API 2028', 'ISO 9001:2015', 'ASME'],
    },
    'guia-de-productos-biogas': {
      titulo: 'Plantas de Biogás y Digestión Anaerobia',
      subtitulo: 'Más energía, menos riesgo.',
      descripcion: 'El biogás (principalmente metano y CO₂) presenta riesgos únicos: es inflamable, puede generar presiones elevadas en digestores y requiere un control preciso de la atmósfera interna. Franko ofrece soluciones certificadas para cada etapa del proceso, desde la digestión hasta el almacenamiento y distribución.',
      imagen: 'assets/images/Imagenes/tn-i-biogas.webp',
      imagenDestacada: 'assets/images/Industries/biogas.webp',
      color: '#16a34a',
      productos: [
        { serie: 'Serie 1000', nombre: 'Alivio de Presión / Vacío',         descripcion: 'Controla la presión interna de digestores y campanas de biogás.',                           ruta: '1000', img: 'assets/images/productos/1000.webp' },
        { serie: 'Serie 1080', nombre: 'Blanketing Baja Presión',            descripcion: 'Empleada para regular el flujo de hidrógeno en los sistemas de Tank Blanketing.',            ruta: '1080', img: 'assets/images/productos/1080.webp' },
        { serie: 'Serie 2000', nombre: 'Arrestador de Deflagración',         descripcion: 'Arrestador de flama para aplicaciones fin-de-línea en redes de biogás.',                    ruta: '2000', img: 'assets/images/productos/2000.webp' },
        { serie: 'Serie 2010', nombre: 'Arrestador de Detonación',           descripcion: 'Protege redes de distribución de biogás de largo recorrido contra detonaciones.',            ruta: '2010', img: 'assets/images/productos/2010.webp' },
        { serie: 'Serie 3010', nombre: 'Ventila de Emergencia BP',           descripcion: 'Alivio de emergencia de gran volumen para digestores con sobrepresión.',                    ruta: '3010', img: 'assets/images/productos/3010.webp' },
        { serie: 'Serie 5010', nombre: 'Transmisor Ultrasónico',             descripcion: 'Medición de nivel sin contacto en digestores de alta viscosidad.',                          ruta: '5010', img: 'assets/images/productos/5010.webp' },
        { serie: 'Serie 5020', nombre: 'Switch Magnético',                   descripcion: 'Control automático de nivel para arranque/paro de equipos en plantas de biogás.',           ruta: '5020', img: 'assets/images/productos/5020.webp' },
        { serie: 'Serie 3000', nombre: 'Escotilla de Medición',              descripcion: 'Permite acceder al tanque para tomar muestras del contenido.',                               ruta: '3000', img: 'assets/images/productos/3000.webp' },
      ],
      desafios: [
        'Control de presión interna en digestores y gasómetros',
        'Riesgo de detonación en redes de distribución de biogás',
        'Medición continua de nivel en digestores de alta viscosidad',
        'Protección de equipos contra sobrepresión por producción excesiva',
      ],
      soluciones: [
        'Válvulas P/V de baja presión para digestores y campanas de gas',
        'Tank blanketing para mantener atmósfera inerte en almacenamiento',
        'Arrestadores de flama en redes de distribución de biogás',
        'Transmisores de nivel ultrasónicos sin contacto para digestores',
      ],
      normas: ['EN 12952', 'ISO 16852', 'NFPA 30B', 'ISO 9001:2015'],
    },
    'guia-de-productos-refinerias': {
      titulo: 'Refinerías y Terminales de Almacenamiento',
      subtitulo: 'Reduce mermas. Opera sin interrupciones.',
      descripcion: 'Las refinerías y terminales de almacenamiento de combustibles operan con grandes volúmenes de productos inflamables bajo condiciones severas de presión y temperatura. La pérdida de producto por venteo ineficiente y los accidentes por falla de equipos de seguridad representan riesgos inaceptables. Franko ofrece la línea completa de equipos para proteger su operación.',
      imagen: 'assets/images/Imagenes/tn-i-refinery.webp',
      imagenDestacada: 'assets/images/Industries/refinery.webp',
      color: '#b45309',
      productos: [
        { serie: 'Serie 1000', nombre: 'Alivio de Presión / Vacío',         descripcion: 'Válvula de alta capacidad API 2000 para tanques de techo fijo y flotante.',                 ruta: '1000', img: 'assets/images/productos/1000.webp' },
        { serie: 'Serie 1040', nombre: 'Válvula de Alivio de Presión',       descripcion: 'Válvula de alivio únicamente de presión para tanques de proceso.',                          ruta: '1040', img: 'assets/images/productos/1040.webp' },
        { serie: 'Serie 3010', nombre: 'Ventila de Emergencia BP',           descripcion: 'Ventila de emergencia para alivio de gran volumen en baja presión.',                        ruta: '3010', img: 'assets/images/productos/3010.webp' },
        { serie: 'Serie 3015', nombre: 'Ventila con Brazo',                  descripcion: 'Ventila de emergencia tipo brazo articulado con acceso directo al tanque.',                 ruta: '3015', img: 'assets/images/productos/3015.webp' },
        { serie: 'Serie 3030', nombre: 'Ventila Presión/Vacío',              descripcion: 'Ventila de emergencia combinada presión-vacío para protección secundaria.',                 ruta: '3030', img: 'assets/images/productos/3030.webp' },
        { serie: 'Serie 2200', nombre: 'Cámara de Espuma',                   descripcion: 'Sistema de extinción de incendios para parques de tanques de combustible.',                 ruta: '2200', img: 'assets/images/productos/2200.webp' },
        { serie: 'Serie 2210', nombre: 'Formador de Espuma',                 descripcion: 'Formador de espuma para protección activa de tanques de almacenamiento.',                   ruta: '2210', img: 'assets/images/productos/2210.webp' },
        { serie: 'Serie 4000', nombre: 'Ind. Tubular Acorazado',             descripcion: 'Indicador de nivel por vasos comunicantes para crudos y productos pesados.',                ruta: '4000', img: 'assets/images/productos/4000.webp' },
      ],
      desafios: [
        'Gestión de vapores de hidrocarburos en tanques de techo fijo y flotante',
        'Control de presión en condiciones de llenado, vaciado y variación térmica',
        'Protección contra incendios en parques de tanques de gran capacidad',
        'Medición confiable de nivel en hidrocarburos pesados y crudos',
      ],
      soluciones: [
        'Válvulas P/V de alta capacidad certificadas API 2000 para tanques de gran volumen',
        'Ventilas de emergencia de paleta para protección secundaria',
        'Sistemas de espuma NFPA 11 para extinción en tanques de almacenamiento',
        'Indicadores de nivel tubulares para crudos y productos pesados',
      ],
      normas: ['API 2000', 'ISO 28300', 'NFPA 11', 'NFPA 30', 'API 650', 'ISO 9001:2015'],
    },
  };

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  // ngOnInit: se ejecuta una vez al crear el componente
  // Suscribe los segmentos de URL para detectar a qué industria corresponde la ruta activa
  // y cargar el objeto de datos correspondiente del mapa this.data
  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      // Reconstruye el slug de la URL uniendo los segmentos con "/"
      // ej. [{path:'guia-de-productos-biogas'}] → "guia-de-productos-biogas"
      const url = segments.map(s => s.path).join('/');
      this.slug = url;
      // Busca los datos de la industria en el mapa; null si el slug no existe (ruta no reconocida)
      this.industria = this.data[url] ?? null;
      // Con OnPush, markForCheck() notifica a Angular que este componente necesita re-renderizarse
      this.cdr.markForCheck();
    });
  }
}
