// ── Servicio de productos — Firebase Firestore ────────────────────────────────
// Usa Firebase JS SDK directo (sin @angular/fire) — compatible con Angular 22.
// Colección: 'productos'
// ID de documento: slug del producto (ej: "valvula-alivio-presion-vacio")
//
// Arquitectura de la colección 'productos':
//   - serie, slug, titulo, categoriaId, categoriaNombre
//   - descripcionCorta, imagen, galeria[], activo, tabs[]
//   - informacionGeneral { descripcionIntro, descripcion,
//       caracteristicasEspeciales[], caracteristicasTecnicas{} ,
//       aplicaciones, funcionamiento }
//   - ventajasMarca  (string vacío si no aplica)
//   - accesorios     (string vacío si no aplica)
//
// Sin colección separada de 'tabs' — todo en el documento del producto.
// Ordenamiento client-side para evitar índices compuestos en Firestore.

import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, getDoc,
  doc, query, where, Firestore,
} from 'firebase/firestore';

import { environment }          from '../../environments/environment';
import { Producto, TabId }      from '../models/producto.model';

// ── Singleton Firebase ────────────────────────────────────────────────────────
// getApps().length evita "Firebase App named '[DEFAULT]' already exists"
const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly COL = 'productos';

  // ── Todos los productos activos ordenados por serie ───────────────────────
  getTodosLosProductos(): Observable<Producto[]> {
    return from(getDocs(collection(db, this.COL))).pipe(
      map(snap =>
        snap.docs
          .map(d => ({ ...d.data() } as Producto))
          .filter(p => p.activo !== false)
          .sort((a, b) => Number(a.serie) - Number(b.serie))
      ),
      catchError(err => {
        console.error('[ProductService] getTodosLosProductos:', err);
        return of([]);
      })
    );
  }

  // ── Producto por slug (ID del documento) o por serie ─────────────────────
  // Primero intenta por ID directo (slug), luego busca por campo 'serie'
  getProductoBySlug(id: string): Observable<Producto | null> {
    // Intento 1: el ID del documento ES el slug
    const docRef = doc(db, this.COL, id);
    return from(getDoc(docRef)).pipe(
      switchMap(snap => {
        if (snap.exists()) {
          return of(snap.data() as Producto);
        }
        // Intento 2: buscar por campo 'serie' (cuando la URL usa el número)
        const q = query(
          collection(db, this.COL),
          where('serie', '==', id)
        );
        return from(getDocs(q)).pipe(
          map(snap2 => {
            if (snap2.empty) return null;
            return snap2.docs[0].data() as Producto;
          })
        );
      }),
      catchError(err => {
        console.error('[ProductService] getProductoBySlug:', err);
        return of(null);
      })
    );
  }

  // ── Productos de la misma categoría (sin el actual) ───────────────────────
  getProductosByCategoria(
    categoriaId: string,
    slugExcluir?: string
  ): Observable<Producto[]> {
    const q = query(
      collection(db, this.COL),
      where('categoriaId', '==', categoriaId)
    );
    return from(getDocs(q)).pipe(
      map(snap =>
        snap.docs
          .map(d => d.data() as Producto)
          .filter(p => p.activo !== false && p.slug !== slugExcluir)
          .sort((a, b) => Number(a.serie) - Number(b.serie))
      ),
      catchError(err => {
        console.error('[ProductService] getProductosByCategoria:', err);
        return of([]);
      })
    );
  }

  // ── Tabs de un producto ───────────────────────────────────────────────────
  // Los tabs están dentro del documento del producto — sin colección extra
  getTabsByProducto(slug: string): Observable<TabId[]> {
    return this.getProductoBySlug(slug).pipe(
      map(p => p?.tabs ?? (['informacion-general'] as TabId[]))
    );
  }
}
