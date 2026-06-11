// ── Modelos de datos de Franko Instrumentación ────────────────────────────────
// Fuente de datos: src/app/data/productos.json (generado desde DB_Productos.xlsx)
// Sin dependencias de Firebase — datos 100% locales en el bundle

// Imagen de galería: archivo = nombre del .webp, alt = texto alternativo para SEO
export interface ImagenGaleria {
  archivo: string;
  alt:     string;
}

// Sección "Información General" de cada producto
export interface InformacionGeneral {
  descripcionIntro:          string;
  descripcion:               string;
  caracteristicasEspeciales: string[];           // Lista de bullets
  caracteristicasTecnicas:   Record<string, string>; // Tabla key → valor
  aplicaciones:              string;
  funcionamiento:            string;
}

// Tabs disponibles — solo los que aplican a cada producto
export type TabId = 'informacion-general' | 'ventajas-de-nuestra-marca' | 'accesorios';

// Documento principal de producto
export interface Producto {
  serie:            string;
  slug:             string;
  titulo:           string;
  categoriaId:      string;
  categoriaNombre:  string;
  descripcionCorta: string;
  imagen:           string;           // Archivo para catálogo: "1000.webp"
  galeria:          ImagenGaleria[];  // Fotos para detalle/specs
  activo:           boolean;
  tabs:             TabId[];          // Tabs que tiene este producto
  informacionGeneral: InformacionGeneral;
  ventajasMarca:    string;           // Vacío si no aplica
  accesorios:       string;           // Vacío si no aplica
}
