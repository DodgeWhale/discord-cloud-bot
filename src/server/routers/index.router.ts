import { Router } from 'express';

import { getBase } from 'server/controllers/index.controller';

const indexRouter = Router();
indexRouter.get('/', getBase);

export default indexRouter;