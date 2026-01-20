import path from "node:path";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const keyFilename = Bun.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(Bun.env.GOOGLE_APPLICATION_CREDENTIALS)
  : undefined;

export const visionClient = new ImageAnnotatorClient(
  keyFilename ? { keyFilename } : {}
);
