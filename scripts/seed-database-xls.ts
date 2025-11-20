import { join } from 'path';
import Database from '../src/config/database';
import { ProductRepository } from '../src/repositories/product.repository';
import { CreateProductDTO } from '../src/types/product.types';

// Necesitarás instalar: npm install xlsx
// Este es un script alternativo para archivos .xls
const XLSX = require('xlsx');

/**
 * Script para poblar la base de datos con datos desde Excel (.xls)
 */
const seedDatabase = async (): Promise<void> => {
  const database = Database.getInstance();
  const pool = database.getPool();
  const productRepository = new ProductRepository(pool);

  try {
    console.log('🌱 Iniciando seed de la base de datos desde Excel (.xls)...');

    // Leer archivo Excel .xls
    const excelPath = join(__dirname, '..', 'bailey.xls');
    const workbook = XLSX.readFile(excelPath);
    
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`📄 Leyendo hoja: ${sheetName}`);

    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Mostrar primeras filas para debug
    console.log('\n📋 Primeras 3 filas del Excel:');
    rawData.slice(0, 3).forEach((row: any, index: number) => {
      console.log(`Fila ${index + 1}:`, row);
    });
    console.log('');

    // Convertir filas a productos
    const sampleData: CreateProductDTO[] = [];
    
    // Saltar la primera fila (encabezados)
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      
      // Mapear columnas del Excel a tu estructura de producto
      // AJUSTA ESTOS ÍNDICES según lo que veas en el debug arriba
      const product: CreateProductDTO = {
        code: row[0] ? String(row[0]).trim() : null, // Columna A (índice 0)
        reference: row[1] ? String(row[1]).trim() : '', // Columna B (índice 1)
        description: row[2] ? String(row[2]).trim() : '', // Columna C (índice 2)
        stock: row[3] ? Number(row[3]) : 0, // Columna D (índice 3)
        wholesale_price_bs: row[4] ? Number(row[4]) : 0, // Columna E (índice 4)
        retail_price: row[5] ? Number(row[5]) : 0, // Columna F (índice 5)
        wholesale_price_usd: row[6] ? Number(row[6]) : 0, // Columna G (índice 6)
      };
      
      // Validar que tenga al menos referencia
      if (product.reference) {
        sampleData.push(product);
      }
    }

    console.log(`📦 Encontrados ${sampleData.length} productos para insertar`);

    let successCount = 0;
    let errorCount = 0;

    // Insertar productos
    for (const productData of sampleData) {
      try {
        await productRepository.create(productData);
        console.log(`✅ Producto creado: ${productData.reference}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error al crear producto ${productData.reference}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📦 Total: ${sampleData.length}`);

    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    await database.close();
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();
