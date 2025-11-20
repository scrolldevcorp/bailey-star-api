import { readFileSync } from 'fs';
import { join } from 'path';
import Database from '../../infrastructure/db/database';

/**
 * Ejecutar migraciones de base de datos
 */
const runMigrations = async (): Promise<void> => {
  const database = Database.getInstance();
  const pool = database.getPool();

  try {
    console.log('🔄 Iniciando migraciones...');

    // Leer archivo de migración
    const migrationPath = join(__dirname, '001_create_products_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Ejecutar migración
    await pool.query(migrationSQL);

    console.log('✅ Migración 001_create_products_table.sql ejecutada exitosamente');
    console.log('✅ Todas las migraciones completadas');

    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    await database.close();
    process.exit(1);
  }
};

// Ejecutar migraciones
runMigrations();
