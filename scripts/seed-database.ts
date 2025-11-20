import { join } from 'path';
import ExcelJS from 'exceljs';
import Database from '../src/infrastructure/db/database';
import { ProductRepository } from '../src/infrastructure/repositories/postgress-product.repository';
import { CreateProductDTO } from '../src/domain/entities/product.entity';

/**
 * Script para poblar la base de datos con datos desde Excel
 * Mejora: reintentos por registro con backoff exponencial y logging sin detener el flujo.
 */

// Configuración de reintentos
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 500;
const BACKOFF_FACTOR = 2; // multiplicador exponencial
const JITTER_MS = 100; // jitter aleatorio para evitar sincronización

// Helper: espera
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper: determine si un error es reintentable
const isRetryableError = (err: any): boolean => {
  if (!err) return true;
  const code = err.code ? String(err.code) : '';
  const msg = err.message ? String(err.message).toLowerCase() : '';

  // Postgres unique_violation: 23505 -> no reintentar
  if (code === '23505') return false;

  // Mensajes que indican duplicado/único -> no reintentar
  if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('violat')) return false;

  // Fallas obvias de validación que no valen retry (ejemplo genérico)
  if (msg.includes('validation') || msg.includes('invalid')) return false;

  // Si es un error de conexión o timeout, sí reintentamos
  if (msg.includes('timeout') || msg.includes('connection') || msg.includes('econnreset') || msg.includes('ecancelled')) return true;

  // Por defecto: reintentable
  return true;
};

// Helper: retry con backoff exponencial y jitter
async function retryAsync<T>(
  fn: () => Promise<T>,
  attempts = MAX_RETRIES,
  initialDelay = INITIAL_DELAY_MS,
  backoffFactor = BACKOFF_FACTOR
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      attempt++;
      if (attempt > 1) {
        console.log(`   🔁 Reintento ${attempt}/${attempts}...`);
      }
      const res = await fn();
      return res;
    } catch (err: any) {
      const retryable = isRetryableError(err);
      const isLastAttempt = attempt >= attempts;
      const errMsg = (err && (err.message || JSON.stringify(err))) || String(err);

      if (!retryable) {
        // Error no reintentable: lanzar para que el caller lo maneje inmediatamente
        const e = new Error(`Non-retryable error: ${errMsg}`);
        // adjuntar info original
        (e as any).original = err;
        throw e;
      }

      if (isLastAttempt) {
        // agotadas las oportunidades
        const e = new Error(`Retry failed after ${attempts} attempts: ${errMsg}`);
        (e as any).original = err;
        throw e;
      }

      // esperar con backoff exponencial + jitter
      const jitter = Math.floor(Math.random() * JITTER_MS);
      console.warn(`   ⚠️ Intento ${attempt} falló: ${errMsg}. Esperando ${delay + jitter}ms antes del próximo intento...`);
      await sleep(delay + jitter);
      delay = Math.round(delay * backoffFactor);
      // y volver a intentar
    }
  }
}

const seedDatabase = async (): Promise<void> => {
  const database = Database.getInstance();
  const pool = database.getPool();
  const productRepository = new ProductRepository(pool);

  try {
    console.log('🌱 Iniciando seed de la base de datos desde Excel...');

    // Leer archivo Excel
    const excelPath = join(__dirname, '..', 'bailey.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);

    // Obtener la primera hoja
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error('No se encontró ninguna hoja en el archivo Excel');
    }

    console.log(`📄 Leyendo hoja: ${worksheet.name}`);
    console.log(`📊 Total de filas: ${worksheet.rowCount}`);
    console.log(`📊 Total de columnas: ${worksheet.columnCount}\n`);

    // Mostrar primeras 3 filas para debug
    console.log('📋 Primeras 3 filas del Excel:');
    let debugCount = 0;
    worksheet.eachRow((row, rowNumber) => {
      if (debugCount < 3) {
        const values = row.values as any[];
        console.log(`Fila ${rowNumber}:`, values);
        debugCount++;
      }
    });
    console.log('');

    // Convertir filas a productos
    const sampleData: CreateProductDTO[] = [];

    // Asumiendo que la primera fila son encabezados
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar encabezados

      const values = row.values as any[];

      const product: CreateProductDTO = {
        code: values[1] ? String(values[1]).trim() : null, // Columna A
        description: values[2] ? String(values[2]).trim() : '', // Columna B
        reference: values[3] ? String(values[3]).trim() : '', // Columna C
        stock: values[4] ? Number(values[4]) : 0, // Columna D
        wholesale_price_bs: values[5] ? Number(values[5]) : 0, // Columna E
        retail_price: values[6] ? Number(values[6]) : 0, // Columna F
        wholesale_price_usd: values[7] ? Number(values[7]) : 0, // Columna G
      };

      if (product.reference) {
        sampleData.push(product);
      }
    });

    console.log(`📦 Encontrados ${sampleData.length} productos para insertar`);

    let successCount = 0;
    let errorCount = 0;
    const failedRecords: Array<{ product: CreateProductDTO; reason: string; original?: any }> = [];

    // Mostrar primeros 3 productos a insertar para debug
    console.log('🔍 Primeros 3 productos a insertar:');
    sampleData.slice(0, 3).forEach((product, index) => {
      console.log(`\nProducto ${index + 1}:`, JSON.stringify(product, null, 2));
    });
    console.log('\n');

    // Insertar productos secuencialmente con reintentos por registro
    for (const productData of sampleData) {
      try {
        await retryAsync(
          async () => {
            // En este archivo se hace la instanciación del repositorio arriba
            // Aquí se invoca el create que hace el insert en DB
            return await productRepository.create(productData);
          },
          MAX_RETRIES,
          INITIAL_DELAY_MS,
          BACKOFF_FACTOR
        );

        console.log(`✅ Producto creado: ${productData.reference}`);
        successCount++;
      } catch (error: any) {
        // Si llega aquí, los reintentos fallaron o el error fue no-reintentable
        const reason = (error && (error.message || JSON.stringify(error))) || 'Unknown error';
        console.error(`❌ Error definitivo al crear producto ${productData.reference}: ${reason}`);
        errorCount++;
        failedRecords.push({ product: productData, reason, original: (error && (error.original || error)) });
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Creados: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📦 Total: ${sampleData.length}`);

    if (failedRecords.length > 0) {
      console.log('\n📝 Registros fallidos (primeros 20 mostrados):');
      failedRecords.slice(0, 20).forEach((f, i) => {
        console.log(` ${i + 1}. reference=${f.product.reference} reason=${f.reason}`);
      });
      // Podrías volcar failedRecords a JSON para reintentos manuales:
      // import fs from 'fs'; fs.writeFileSync('failed-records.json', JSON.stringify(failedRecords, null, 2));
    }

    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    try {
      await database.close();
    } catch (e) {
      console.error('Error cerrando DB:', e);
    }
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();
