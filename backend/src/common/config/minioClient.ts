import { Client } from 'minio';

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
    const exists = await minioClient.bucketExists(bucketName);

    if (!exists) {
      console.log(`Bucket "${bucketName}" does not exist. Creating...`);
      await minioClient.makeBucket(bucketName, '');
      console.log(`Bucket "${bucketName}" created successfully.`);
    } else {
      console.log(`MinIO connected and bucket "${bucketName}" exists.`);
    }
  } catch (err) {
    console.error('Cannot connect to MinIO:', err);
    process.exit(1);
  }
}

export default minioClient;
