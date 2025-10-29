import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : null;

const client = new ImageAnnotatorClient(
    credentialsPath
        ? { keyFilename: credentialsPath }
        : {}
);

export async function extractTextFromImage(image: string | Buffer): Promise<string | null> {
  try {
    let result;

    if (Buffer.isBuffer(image)) {
      // ถ้าเป็น buffer ส่ง content ให้ Google Vision
      [result] = await client.textDetection({ image: { content: image } });
    } else {
      // path หรือ URL
      [result] = await client.textDetection(image);
    }

    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) return "";

    return detections[0].description?.trim() ?? "";
  } catch (error: any) {
    console.error("[OCR] เกิดข้อผิดพลาด:", error.message || error);
    return null;
  }
}