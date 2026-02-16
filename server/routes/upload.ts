import { Router } from 'express';
import multer from 'multer';
import { uploadToS3 } from '../s3.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /api/upload - generic file upload to S3
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = (req.body.folder as string) || 'uploads';
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${timestamp}_${safeName}`;

    const url = await uploadToS3(key, req.file.buffer, req.file.mimetype);

    res.json({ url, key, filename: req.file.originalname, size: req.file.size });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
