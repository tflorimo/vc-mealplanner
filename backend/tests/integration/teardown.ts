// globalTeardown: elimina la base de test al finalizar.

import dotenv from 'dotenv';
import path from 'path';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

const DB_HOST     = process.env['DB_HOST']     ?? 'localhost';
const DB_PORT     = parseInt(process.env['DB_PORT'] ?? '3306', 10);
const DB_USER     = process.env['DB_USER']     ?? 'root';
const DB_PASSWORD = process.env['DB_PASSWORD'] ?? 'rootpass';
const DB_NAME     = process.env['DB_NAME']     ?? 'vc_mealplanner_test';

export default async function teardown() {
  const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD });
  await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
  await conn.end();
}
