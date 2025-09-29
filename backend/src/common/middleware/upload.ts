import multer, { FileFilterCallback } from 'multer';
import { Request, Express } from 'express';

// ไฟล์ที่อนุญาต
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (imageMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed'));
    }
  },
});
