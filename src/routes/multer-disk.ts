import multer from 'multer';
import { Request, Router } from 'express';

import MulterDiskHandler from '../handlers/multer-disk';

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV files are allowed.'));
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, './uploads'),
  filename: (_req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + '.csv'),
});

const upload = multer({ storage, fileFilter });

const router = Router();

router.use(upload.single('csv'));

router.post('/organizations', new MulterDiskHandler().createOrganization);
router.post('/ial-stats', new MulterDiskHandler().createIalStat);

export default router;
