// globalSetup: crea la base de test y ejecuta todas las migraciones.
// Corre una sola vez antes de todos los tests de integración.

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

const DB_HOST     = process.env['DB_HOST']     ?? 'localhost';
const DB_PORT     = parseInt(process.env['DB_PORT'] ?? '3306', 10);
const DB_USER     = process.env['DB_USER']     ?? 'root';
const DB_PASSWORD = process.env['DB_PASSWORD'] ?? 'rootpass';
const DB_NAME     = process.env['DB_NAME']     ?? 'vc_mealplanner_test';
const MIGRATIONS  = process.env['MIGRATIONS_DIR'] ?? path.resolve(__dirname, '../../../database/migrations');

export default async function setup() {
  const root = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD });

  await root.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
  await root.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await root.query(`USE \`${DB_NAME}\``);

  const files = fs.readdirSync(MIGRATIONS)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS, file), 'utf-8');
    // Ejecutar sentencias separadas por ;
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await root.query(stmt);
    }
  }

  await root.end();
}
