/**
 * importar-firestore.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Lee src/app/data/productos.json y sube todos los productos a Firestore.
 *
 * Colección : productos
 * ID doc    : slug del producto  (ej: "valvula-alivio-presion-vacio")
 *
 * Uso:
 *   1. Asegúrate de tener serviceAccountKey.json en scripts/
 *   2. npm install firebase-admin   (solo la primera vez)
 *   3. node scripts/importar-firestore.mjs
 */

import { createRequire } from 'module';
import { fileURLToPath }  from 'url';
import { dirname, join }  from 'path';
import { readFileSync }   from 'fs';

const require   = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }        = require('firebase-admin/firestore');

// ── Credenciales de servicio ──────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Leer JSON ─────────────────────────────────────────────────────────────────
const productos = JSON.parse(
  readFileSync(join(__dirname, '../src/app/data/productos.json'), 'utf-8')
);

// ── Importar ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Importando ${productos.length} productos a Firestore...\n`);

  let ok = 0, errores = 0;

  for (const producto of productos) {
    // El ID del documento es el slug — único, limpio y legible en la URL
    const docId = producto.slug;

    try {
      await db.collection('productos').doc(docId).set(producto);
      console.log(`  ✅  Serie ${producto.serie.padStart(4)} — ${docId}`);
      ok++;
    } catch (err) {
      console.error(`  ❌  Serie ${producto.serie}: ${err.message}`);
      errores++;
    }
  }

  console.log(`\n${'─'.repeat(55)}`);
  console.log(`✅  Importados correctamente : ${ok}`);
  if (errores > 0)
    console.log(`❌  Con error               : ${errores}`);
  console.log(`${'─'.repeat(55)}\n`);

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
