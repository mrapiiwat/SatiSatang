import path from "node:path";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : undefined;

export const visionClient = new ImageAnnotatorClient(
  keyFilename ? { keyFilename } : {}
);
