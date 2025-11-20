import { createApp } from './http/app';
import config from '../core/config/environment';
import Database from '../infrastructure/db/database';

export const startServer = async (): Promise<void> => {
  try {
    const database = Database.getInstance();
    const isConnected = await database.testConnection();

    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    const app = createApp();

    app.listen(config.port, () => {
      console.log('🚀 Servidor iniciado');
      console.log(`📍 Puerto: ${config.port}`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
      console.log(`🗄️  Base de datos: ${config.database.name}`);
      console.log(`📡 API disponible en: http://localhost:${config.port}`);
    });

    process.on('SIGTERM', async () => {
      console.log('⚠️  SIGTERM recibido, cerrando servidor...');
      await database.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('⚠️  SIGINT recibido, cerrando servidor...');
      await database.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};
