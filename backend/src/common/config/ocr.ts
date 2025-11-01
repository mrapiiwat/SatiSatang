import { ImageAnnotatorClient } from '@google-cloud/vision';
import type { protos } from '@google-cloud/vision';

import path from 'path';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

const client = new ImageAnnotatorClient(credentialsPath ? { keyFilename: credentialsPath } : {});

export async function extractTextFromImage(image: string | Buffer): Promise<string> {
  try {
    let result: protos.google.cloud.vision.v1.IAnnotateImageResponse | undefined;

    if (Buffer.isBuffer(image)) {
      [result] = await client.textDetection({ image: { content: image } });
    } else {
      [result] = await client.textDetection({ image: { source: { imageUri: image } } });
    }

    const detections = result?.textAnnotations;
    if (!detections?.length || !detections[0].description) {
      console.warn('[OCR] ไม่พบข้อความในภาพ');
      return '';
    }

    return detections[0].description.trim();
  } catch (error) {
    if (error instanceof Error) {
      console.error('[OCR] เกิดข้อผิดพลาด:', error.message);
    } else {
      console.error('[OCR] เกิดข้อผิดพลาดที่ไม่ทราบประเภท');
    }
    return '';
  }
}
