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

const multerMemmoryRouter = Router();

multerMemmoryRouter.use(upload.single('csv'));

multerMemmoryRouter.post('/regions', new MulterMemmoryHandler().createRegions);
multerMemmoryRouter.post('/provinces', new MulterMemmoryHandler().createProvinces);
multerMemmoryRouter.post('/districts', new MulterMemmoryHandler().createDistricts);
multerMemmoryRouter.post('/subdistricts', new MulterMemmoryHandler().createSubdistricts);

export default multerMemmoryRouter;
