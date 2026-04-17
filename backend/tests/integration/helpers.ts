import request from 'supertest';
import mysql from 'mysql2/promise';
import { createApp } from '../../src/app';

// Una sola instancia de la app Express para todos los tests de integración
export const app = createApp();
export const agent = request(app);

const DB_HOST     = process.env['DB_HOST']     ?? 'localhost';
const DB_PORT     = parseInt(process.env['DB_PORT'] ?? '3306', 10);
const DB_USER     = process.env['DB_USER']     ?? 'root';
const DB_PASSWORD = process.env['DB_PASSWORD'] ?? 'rootpass';
const DB_NAME     = process.env['DB_NAME']     ?? 'vc_mealplanner_test';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD,
      database: DB_NAME, connectionLimit: 5, decimalNumbers: true,
    });
  }
  return pool;
}

// Limpia las tablas relevantes manteniendo el usuario por defecto (id=1)
export async function cleanTables(...tables: string[]) {
  const conn = await getPool().getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of tables) {
      await conn.query(`TRUNCATE TABLE \`${t}\``);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    // Recrear usuario por defecto si se limpió la tabla users
    if (tables.includes('users')) {
      await conn.query(`INSERT IGNORE INTO users (id, display_name, diners) VALUES (1, 'Default User', 2)`);
    }
  } finally {
    conn.release();
  }
}
