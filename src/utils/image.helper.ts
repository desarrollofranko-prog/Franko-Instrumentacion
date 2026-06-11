// Dos carpetas de imágenes en el proyecto:
//   Catalogo-productos/              → Tarjetas de listado (miniatura cuadrada)
//   fotos-especificaciones-productos/ → Detalles del producto (galería, carrusel)
//
// Firestore solo guarda el nombre del archivo ("1000.webp").
// Este helper construye la ruta completa según el contexto (catálogo o detalles).
//
// IMPORTANTE: todas las funciones son defensivas ante valores undefined/null/vacíos
// para no romper el template cuando un documento de Firestore tenga campos faltantes.

const CATALOG_PATH = 'assets/imagenes-Productos/Catalogo-productos/';
const SPECS_PATH   = 'assets/imagenes-Productos/fotos-especificaciones-productos/';

/** Imagen para la tarjeta del catálogo de productos */
export function getCatalogImageUrl(archivo: string | undefined | null): string {
  if (!archivo || archivo.trim() === '') return 'assets/images/placeholder.webp';
  if (archivo.startsWith('assets/') || archivo.startsWith('http')) return archivo;
  return `${CATALOG_PATH}${archivo}`;
}

/** Imagen para el detalle del producto (specs, carrusel de galería) */
export function getSpecsImageUrl(archivo: string | undefined | null): string {
  if (!archivo || archivo.trim() === '') return 'assets/images/placeholder.webp';
  if (archivo.startsWith('assets/') || archivo.startsWith('http')) return archivo;
  return `${SPECS_PATH}${archivo}`;
}

/** Alias de compatibilidad — por defecto apunta a specs */
export function getImageUrl(archivo: string | undefined | null): string {
  return getSpecsImageUrl(archivo);
}

/** Thumbnail: usa la misma imagen de specs (CSS la reduce) */
export function getThumbnailUrl(archivo: string | undefined | null): string {
  return getSpecsImageUrl(archivo);
}

/** Handler de error en <img>: oculta la imagen si no se puede cargar */
export function onImagenError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (img) {
    img.style.display = 'none';
  }
}