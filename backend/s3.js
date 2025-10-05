import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Genera una URL prefirmada para subir una imagen
export async function generateUploadURL() {
  const bucketName = process.env.AWS_S3_BUCKET;
  if (!bucketName) throw new Error("❌ Falta AWS_S3_BUCKET en el .env");

  // nombre aleatorio
  const imageName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageName,
    ContentType: "image/jpeg",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  // 🔥 Devuelve ambos correctamente
  return { uploadUrl, key: imageName };
}
