import { Router } from 'express';

import { checkInactiveChannels } from 'server/controllers/tasks.controller';

const tasksRouter = Router();
tasksRouter.get('/inactivity', checkInactiveChannels);

export default tasksRouter;