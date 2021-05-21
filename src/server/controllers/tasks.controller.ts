import { Request, Response } from 'express';

import { success } from 'server/controller';

/**
 *	Google App Engine Cron job
 */
export function checkInactiveChannels(req: Request, res: Response) {
	// TODO
	success(res);
}