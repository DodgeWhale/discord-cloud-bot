import { Request, Response, NextFunction, CookieOptions } from 'express';

import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

import { PORT } from 'server/app';
import { voiceChannelExists } from 'server/bot';

import { badRequest, success } from 'server/controller';

const _defaultSecret = 'secret007';
const tokenSecret = process.env.TOKEN_SECRET || _defaultSecret;

if (tokenSecret === _defaultSecret) {
	console.warn('Using default secret for signing JWTs!');
}

const signOptions: SignOptions = {
	algorithm: 'HS256',
	issuer: process.env.URL + ':' + PORT,
	expiresIn: '24h',
	audience: '/'
}

const hour = 1000 * 60 * 60;
const cookieOptions: CookieOptions = {
	httpOnly: true,
	expires: new Date(Date.now() + hour * 24)
}

export function serverIsEnabled(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies.token;
	if (!token) return badRequest(res, 'Unauthorized: No token provided', 401);

	jwt.verify(token, tokenSecret, function (err: Error, decoded: any) {
		if (err || !decoded.voiceChannel) return badRequest(res, 'Unauthorized: Invalid token', 401);

		// Authorised
		req.voiceChannel = decoded.voiceChannel;
		next();
	});
}

export function enableServer(req: Request, res: Response) {
	const { body } = req;
	if (!body) return badRequest(res, 'Missing POST body');

	const { voiceChannel } = body;
	if (!voiceChannel) return badRequest(res, 'Missing voiceChannel from POST');

	try {
		if (voiceChannelExists(voiceChannel)) {
			console.info(`Voice channel: ${voiceChannel} exists...`);
		}

		const payload = { voiceChannel };
		const token = jwt.sign(payload, tokenSecret, signOptions);

		console.info(`Sending cookie to server...`);
		res.cookie('token', token, cookieOptions).send({
			success: true
		});
	}
	catch (error) {
		badRequest(res, error.message);
	}
}