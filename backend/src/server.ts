import { createApp } from './app';
import { runMigrations } from './database/runMigrations';
import pool from './config/database';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

// Espera a que MySQL acepte conexiones antes de correr migraciones.
// Necesario en cold-start y cuando ts-node-dev reinicia por cambios de código.
async function waitForDb(maxRetries = 15, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      return;
    } catch {
      console.log(`[server] Esperando MySQL... (intento ${attempt}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('No se pudo conectar a MySQL después de varios intentos.');
}

async function main(): Promise<void> {
  await waitForDb();

  console.log('[server] Ejecutando migraciones de base de datos...');
  await runMigrations();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[server] VC Meal Planner backend corriendo en http://localhost:${PORT}`);
    console.log(`[server] API disponible en http://localhost:${PORT}/api/v1`);
  });
}

main().catch((err) => {
  console.error('[server] Error fatal al iniciar:', err);
  process.exit(1);
});
