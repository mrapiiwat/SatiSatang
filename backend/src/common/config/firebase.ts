import path from "node:path";
import admin from "firebase-admin";

const serviceAccountPath = path.resolve(
  process.cwd(),
  Bun.env.FIREBASE_SERVICE_ACCOUNT!
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const messaging = admin.messaging();
