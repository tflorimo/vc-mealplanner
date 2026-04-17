import dotenv from 'dotenv';
import path from 'path';

// Carga variables de entorno de test antes de que cualquier módulo las lea.
// Esto se ejecuta en cada worker de Jest antes de importar el código de la app.
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
