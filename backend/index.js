import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { generateUploadURL } from "./s3.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Generar URL prefirmada S3
app.get("/api/upload-url", async (req, res) => {
  try {
    const { uploadUrl, key } = await generateUploadURL();
    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("Error generando URL S3:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Obtener threads
app.get("/api/threads", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM threads ORDER BY created_at DESC");
  res.json(rows);
});

// ✅ Crear nuevo thread
app.post("/api/threads", async (req, res) => {
  const { title, content, image_url } = req.body;
  try {
    await db.query(
      "INSERT INTO threads (title, content, image_url) VALUES (?, ?, ?)",
      [title, content, image_url || null]
    );
    res.json({ message: "Thread creado correctamente" });
  } catch (err) {
    console.error("Error al insertar thread:", err);
    res.status(500).json({ error: "Error en base de datos" });
  }
});

app.listen(5000, () => console.log("🚀 Servidor backend corriendo en http://localhost:5000"));
