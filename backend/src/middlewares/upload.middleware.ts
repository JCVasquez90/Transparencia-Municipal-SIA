import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, nombreUnico);
  },
});

const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];

export const uploadArchivo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG o PNG'));
    }
    cb(null, true);
  },
});