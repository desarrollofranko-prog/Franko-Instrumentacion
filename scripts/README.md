# Scripts de Firestore

## importar-firestore.mjs

Sube los 28 productos de `src/app/data/productos.json` a Firestore.

### Pasos

1. Copia tu `serviceAccountKey.json` dentro de esta carpeta `scripts/`
   (lo descargas desde Firebase Console → Configuración del proyecto → Cuentas de servicio)

2. Instala firebase-admin si no lo tienes:
   ```bash
   npm install firebase-admin --save-dev
   ```

3. Ejecuta:
   ```bash
   node scripts/importar-firestore.mjs
   ```

### Resultado esperado

```
🚀 Importando 28 productos a Firestore...

  ✅  Serie 1000 — valvula-alivio-presion-vacio
  ✅  Serie 1010 — valvula-alivio-presion-dirigida
  ...
  ✅  Serie 6020 — mirilla-circular-ventana

───────────────────────────────────────────────────────
✅  Importados correctamente : 28
───────────────────────────────────────────────────────
```

### Estructura del documento en Firestore

```
productos/{slug}
  serie:            "1000"
  slug:             "valvula-alivio-presion-vacio"
  titulo:           "Valvulas de Alivio Presion y Vacio..."
  categoriaId:      "alivio-de-presion"
  categoriaNombre:  "Válvulas de Alivio de Presión"
  descripcionCorta: "Es una válvula que se utiliza..."
  imagen:           "1000.webp"
  galeria:          [{ archivo: "1000.webp", alt: "..." }, ...]
  activo:           true
  tabs:             ["informacion-general", "ventajas-de-nuestra-marca", "accesorios"]
  informacionGeneral:
    descripcionIntro:          "..."
    descripcion:               "..."
    caracteristicasEspeciales: ["...", "..."]
    caracteristicasTecnicas:   { "Medidas": "2, 3, 4...", ... }
    aplicaciones:              "..."
    funcionamiento:            "..."
  ventajasMarca:    "..." (vacío si no aplica)
  accesorios:       "..." (vacío si no aplica)
```
