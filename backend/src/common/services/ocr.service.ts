import type { protos } from "@google-cloud/vision";
import { visionClient } from "@/common/config/google-vision";

export class OCRService {
  async extractTextFromImage(image: string | Buffer): Promise<string> {
    try {
      let result:
        | protos.google.cloud.vision.v1.IAnnotateImageResponse
        | undefined;

      if (Buffer.isBuffer(image)) {
        [result] = await visionClient.textDetection({
          image: { content: image },
        });
      } else {
        [result] = await visionClient.textDetection({
          image: { source: { imageUri: image } },
        });
      }

      const detections = result?.textAnnotations;

      if (!detections?.length || !detections[0].description) {
        console.warn("[OCR] ไม่พบข้อความในภาพ");
        return "";
      }

      return detections[0].description.trim();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[OCR] เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        console.error("[OCR] เกิดข้อผิดพลาดที่ไม่ทราบประเภท:", error);
      }
      return "";
    }
  }
}
