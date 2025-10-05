import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado correctamente a MariaDB en AWS RDS');
    const rows = await conn.query('SELECT NOW() as time');
    console.log('Hora del servidor:', rows[0].time);
    conn.release();
  } catch (err) {
    console.error('❌ Error al conectar:', err);
  } finally {
    pool.end();
  }
}

testConnection();
