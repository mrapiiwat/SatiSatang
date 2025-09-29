import { Client } from 'minio';
import dotenv from 'dotenv';
dotenv.config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!,
});

export async function checkBucket() {
  try {
    const bucketName = process.env.MINIO_BUCKET!;
    await minioClient.bucketExists(bucketName);
    console.log('MinIO connected!');
  } catch (err) {
    console.error('Cannot connect to MinIO:', err);
    process.exit(1);
  }
}

export default minioClient;
