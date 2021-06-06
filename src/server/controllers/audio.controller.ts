import { Request, Response, NextFunction } from 'express';

import { playAudio } from 'server/bot';
import { badRequest, success } from 'server/controller';

export async function processAudioRequest(req: Request, res: Response) {
	const { body, voiceChannel } = req;
	if (!body) return badRequest(res, 'Missing POST body');

	const { file } = body;
	if (!file) return badRequest(res, 'Missing file parameter from body');

	// TODO [?] Don't await promise to speed up response
	let played = await playAudio({
		voiceChannel, file: body.file, volume: body.volume, seek: body.seek
	});

	success(res, { success: played });
};
