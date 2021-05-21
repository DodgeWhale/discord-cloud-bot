import { Router } from 'express';

import { processAudioRequest } from 'server/controllers/audio.controller';
import { serverIsEnabled } from 'server/controllers/enable.controller';

const audioRouter = Router();
audioRouter.post('/', serverIsEnabled, processAudioRequest);

export default audioRouter;