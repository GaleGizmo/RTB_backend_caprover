/*
Script para migrar el campo `site` de la colección `evento`.

Uso:
  - Dry-run (no modifica nada, muestra resumen):
      node scripts/migrate_site_values.js

  - Ejecutar los cambios:
      node scripts/migrate_site_values.js --apply

Requisitos:
  - Tener las variables de entorno en .env (usa DB_URL o CAPROVER_DB_URL).
  - Tener una copia de seguridad antes de ejecutar (mongodump recomendado).

Comportamiento:
  - Intenta aplicar un updateMany con pipeline (si el servidor lo soporta).
  - Si falla, cae a un modo por lotes con bulkWrite.
  - Filtra sólo documentos cuyo `site` contenga una coma, para no tocar los ya correctos.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const DB = process.env.DB_URL || process.env.CAPROVER_DB_URL;
if (!DB) {
  console.error('ERROR: no se ha encontrado variable de entorno DB_URL ni CAPROVER_DB_URL');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

async function migrate() {
  console.log('Conectando a', DB);
  await mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection.db;
  const coll = db.collection('evento');

  const filter = { site: { $type: 'string', $regex: ',' } };

  console.log('Filtrando documentos con coma en `site`...');
  const totalToChange = await coll.countDocuments(filter);
  console.log('Documentos que contienen coma en `site` (candidatos):', totalToChange);

  if (totalToChange === 0) {
    console.log('No hay documentos a actualizar. Saliendo.');
    await mongoose.disconnect();
    return;
  }

  if (!APPLY) {
    console.log('\nDRY RUN (no se aplicarán cambios). Para aplicar, ejecuta con --apply');
    // Previsualizar primeros 20 cambios
    const sample = await coll.find(filter).limit(20).toArray();
    console.log('\nEjemplo de transformaciones (primeros 20 documentos):\n');
    sample.forEach(doc => {
      const oldSite = doc.site;
      const newSite = typeof oldSite === 'string' ? oldSite.split(',')[0].trim() : oldSite;
      console.log(doc._id.toString(), ' -> ', '"' + oldSite + '"', '  =>  ', '"' + newSite + '"');
    });

    await mongoose.disconnect();
    return;
  }

  console.log('\nEjecutando migración: actualizando campo `site` por la parte anterior a la primera coma...');

  // Intentar updateMany con pipeline (más eficiente)
  const pipeline = [
    { $set: { site: { $trim: { input: { $arrayElemAt: [{ $split: ['$site', ','] }, 0] } } } } }
  ];

  try {
    const res = await coll.updateMany(filter, pipeline);
    console.log('updateMany con pipeline ejecutado. Resultado:');
    console.log(res);
  } catch (err) {
    console.warn('updateMany con pipeline falló (posible versión de servidor antigua). Error:', err.message);
    console.log('Cayendo a modo por lotes (bulkWrite)...');

    const batchSize = 500;
    const cursor = coll.find(filter).batchSize(batchSize);
    let bulkOps = [];
    let processed = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const oldSite = doc.site;
      const newSite = typeof oldSite === 'string' ? oldSite.split(',')[0].trim() : oldSite;
      if (newSite !== oldSite) {
        bulkOps.push({ updateOne: { filter: { _id: doc._id }, update: { $set: { site: newSite } } } });
      }
      if (bulkOps.length >= batchSize) {
        const r = await coll.bulkWrite(bulkOps, { ordered: false });
        processed += (r.modifiedCount || 0);
        console.log('Lote aplicado. modificados (hasta ahora):', processed);
        bulkOps = [];
      }
    }
    if (bulkOps.length > 0) {
      const r = await coll.bulkWrite(bulkOps, { ordered: false });
      processed += (r.modifiedCount || 0);
      console.log('Último lote aplicado. modificados (total):', processed);
    }
  }

  // Verificación final
  const remaining = await coll.countDocuments(filter);
  console.log('Documentos que aún contienen coma en `site` (debería ser 0):', remaining);

  await mongoose.disconnect();
  console.log('Migración completada. Conexión cerrada.');
}

migrate().catch(err => {
  console.error('Error durante la migración:', err);
  process.exit(1);
});
