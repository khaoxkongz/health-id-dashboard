import multer from 'multer';
import { Request, Router } from 'express';

import MulterMemmoryHandler from '../handlers/multer-memmory';

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV files are allowed.'));
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5 } });

const router = Router();

router.use(upload.single('csv'));

router.post('/regions', new MulterMemmoryHandler().createRegions);
router.post('/provinces', new MulterMemmoryHandler().createProvinces);
router.post('/districts', new MulterMemmoryHandler().createDistricts);
router.post('/subdistricts', new MulterMemmoryHandler().createSubdistricts);

export default router;
