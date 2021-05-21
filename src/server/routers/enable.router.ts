import { Router } from 'express';

import { enableServer } from 'server/controllers/enable.controller';

const enableRouter = Router();
enableRouter.post('/', enableServer);

export default enableRouter;