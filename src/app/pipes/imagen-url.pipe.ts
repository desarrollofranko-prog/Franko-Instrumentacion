// Conecta el helper de imágenes con los templates HTML.
//
// Uso en templates:
//   Catálogo:  [src]="producto.imagen | imagenUrl:'catalog'"
//   Detalle:   [src]="img.archivo | imagenUrl"
//   Thumb:     [src]="img.archivo | imagenUrl:'thumb'"

import { Pipe, PipeTransform } from '@angular/core';
import { getCatalogImageUrl, getSpecsImageUrl, getThumbnailUrl } from '../../utils/image.helper';

@Pipe({
  name: 'imagenUrl',
  standalone: true,
  pure: true,
})
export class ImagenUrlPipe implements PipeTransform {
  transform(archivo: string, tipo: 'catalog' | 'specs' | 'thumb' = 'specs'): string {
    if (!archivo) return '';
    switch (tipo) {
      case 'catalog': return getCatalogImageUrl(archivo);
      case 'thumb':   return getThumbnailUrl(archivo);
      case 'specs':
      default:        return getSpecsImageUrl(archivo);
    }
  }
}