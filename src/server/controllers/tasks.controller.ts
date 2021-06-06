import { Request, Response } from 'express';
import { bot, isConnectionActive, leaveVoiceChannel } from 'server/bot';

import { success } from 'server/controller';

/**
 *	Google App Engine Cron job
 */
export function checkInactiveChannels(req: Request, res: Response) {
	for (const id of bot.voice.connections.keys()) {
		if (!isConnectionActive(id)) {
			leaveVoiceChannel(id);
		}
	}

	success(res);
}