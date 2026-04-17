import fs from 'fs';
import path from 'path';
import pool from '../config/database';

// Ejecuta los archivos SQL de migrations/ en orden numérico.
// Es idempotente: usa IF NOT EXISTS en todos los CREATE TABLE,
// así que se puede correr en cada arranque sin riesgo.
export async function runMigrations(): Promise<void> {
  // En dev (ts-node): __dirname = backend/src/database → 3 niveles arriba = project root
  // En Docker: __dirname = /app/src/database → 3 niveles arriba = / → /database (volume mount)
  const migrationsDir = process.env['MIGRATIONS_DIR'] ??
    path.join(__dirname, '../../..', 'database', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Directorio de migraciones no encontrado: ${migrationsDir}`);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // orden alfabético = orden numérico (001, 002, ...)

  if (migrationFiles.length === 0) {
    console.log('[migrations] No hay archivos de migración.');
    return;
  }

  const connection = await pool.getConnection();
  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Separar por ';' para ejecutar múltiples statements en un archivo
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await connection.query(statement);
      }

      console.log(`[migrations] ✓ ${file}`);
    }
    console.log('[migrations] Todas las migraciones aplicadas correctamente.');
  } finally {
    connection.release();
  }
}

// Permitir ejecución directa: `ts-node src/database/runMigrations.ts`
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[migrations] Error:', err);
      process.exit(1);
    });
}
