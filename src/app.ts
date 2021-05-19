//#region Imports
import 'dotenv/config';

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { playAudio } from './bot';
import { badRequest, success } from './expressHelpers';
//#endregion

//#region Express application setup
const PORT = Number(process.env.PORT) || 8080;
const app = express();
//#endregion

//#region Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//#endregion

//#region Request handlers
app.get('/', (req: Request, res: Response) => {
	res.send('OK');
});

app.post('/test', (req: Request, res: Response) => {
	console.log(req.body);
	res.send('OK');
});

app.post('/audio', (req: Request, res: Response) => {
	const { body } = req;
	if (!body) return badRequest(res, 'Missing POST body');

	const { file } = body;
	if (!file) return badRequest(res, 'Missing file parameter from body');

	// success(res, { path: audioPath });

	playAudio(file, body.volume);
	res.sendStatus(200);
});
//#endregion

//#region Start application
const server = app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
//#endregion

module.exports = server;