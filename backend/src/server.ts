import { createApp } from './app';
import { runMigrations } from './database/runMigrations';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

async function main(): Promise<void> {
  // Ejecutar migraciones antes de aceptar tráfico
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
