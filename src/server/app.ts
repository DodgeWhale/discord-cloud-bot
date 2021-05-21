//#region Imports
import express from 'express';

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import indexRouter from './routers/index.router';
import audioRouter from './routers/audio.router';
import enableRouter from './routers/enable.router';
import tasksRouter from './routers/tasks.router';
//#endregion

//#region Express application setup
export const PORT = Number(process.env.PORT) || 8080;
const app = express();
//#endregion

//#region Middleware
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//#endregion

//#region Routers
app.use('/', indexRouter);
app.use('/audio', audioRouter);
app.use('/enable', enableRouter);
app.use('/tasks', tasksRouter);
//#endregion

//#region Start application
const server = app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
//#endregion

export default server;