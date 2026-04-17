import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Validar variables de entorno requeridas al arrancar
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Variable de entorno requerida no definida: ${varName}`);
  }
}

// Pool de conexiones MySQL. Un pool maneja reconexiones automáticamente
// y evita abrir una conexión nueva por cada request.
const pool = mysql.createPool({
  host:               process.env['DB_HOST'],
  port:               parseInt(process.env['DB_PORT'] ?? '3306', 10),
  user:               process.env['DB_USER'],
  password:           process.env['DB_PASSWORD'] ?? '',
  database:           process.env['DB_NAME'],
  waitForConnections: true,
  connectionLimit:    10,        // máximo de conexiones simultáneas
  queueLimit:         0,         // 0 = sin límite de cola
  timezone:           '+00:00',  // UTC siempre
  decimalNumbers:     true,      // DECIMAL columns → JS number (no string)
});

export default pool;
