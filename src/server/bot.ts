import path from 'path';
import Discord, { ClientOptions, Collection, StreamOptions, VoiceChannel, VoiceConnection } from 'discord.js';

import { Command, CommandMeta } from './robot/command.interface';
import handleMessage from './robot/message.event';

const commandFolder = './robot/commands/';
const enabledCommands = [
	Command.Start
];

function getCommandList() {
	let commands = new Collection<string, CommandMeta>();

	for (const file of enabledCommands) {
		const command = require(`${commandFolder}${file}.command`).default;
		commands.set(command.name, command);
	}
	return commands;
}

class DodgeBot extends Discord.Client {
	commands: Collection<string, CommandMeta>;

	constructor(options?: ClientOptions) {
		super(options);
		this.commands = getCommandList();
	}
}

//#region Bot instance
const bot = new DodgeBot();
export { bot };
//#endregion

let activityLog: Map<string, number> = new Map();

bot.once('ready', () => {
	console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', handleMessage);

export function voiceChannelExists(channelId: string) {
	const channel = bot.channels.cache.get(channelId);

	if (!channel) throw new Error(`Channel (${channelId}) does not exist`);
	if (channel.type !== 'voice') throw new Error(`Channel (${channelId}) is not a voice channel`);

	return true;
}

//#region Process env variables
if (!process.env.TOKEN) {
	console.error('Invalid Discord Bot access token! (env vars)');
	process.exit(0);
}

// 30 minutes by default
// Custom timeouts are converted to minutes
let channelTimeout = Number(process.env.CHANNEL_TIMEOUT) * 60 * 1000 || null;

if (!channelTimeout) {
	channelTimeout = 1800 * 1000;
	console.log('Using default channel timeout length: 30 minutes');
}
//#endregion

export function isConnectionActive(id: string) {
	const logEntry = activityLog.get(id);
	if (logEntry == null) return false;

	let elapsed = Date.now() - logEntry;
	if (elapsed >= channelTimeout) {
		// Channel has reached the timeout threshold
		return false;
	}

	// Channel is still active
	return true;
}

export function getConnection(id: string): VoiceConnection {
	return bot.voice.connections.get(id);
}

export async function getNewOrExistingConnection(channel: VoiceChannel): Promise<[boolean, VoiceConnection]> {
	const { id, name } = channel;

	let connection = getConnection(id) || null;
	if (connection) return [false, connection];

	try {
		connection = await channel.join();
		activityLog.set(id, Date.now());

		console.info(`Joined voice channel: ${name} (${id})`);
		return [true, connection];
	}
	catch (error) {
		console.error(`Unable to join channel: ${name} (${id})`);
		throw error;
	}
}

export const baseAudioPath = path.join(__dirname, process.env.CLIPS_FOLDER || '../audio/');

export function getFilePath(file: string) {
	if (!file) throw new Error('Invalid audio file name');

	return path.join(baseAudioPath, file);
}

export interface AudioRequest {
	voiceChannel: string,
	file: string,
	volume: number,
	seek?: number
}

export async function playAudio(request: AudioRequest) {
	const { file, volume } = request;

	try {
		const channel = bot.channels.cache.get(request.voiceChannel) as VoiceChannel;

		if (!channel || channel.members.size === 0) return false;

		// Get existing, or start a new connection
		const [createdNow, connection] = await getNewOrExistingConnection(channel);

		if (!createdNow) {
			// Update last activity to prevent connection cron timeout
			activityLog.set(channel.id, Date.now());
		}

		const audioFile = getFilePath(file);
		console.info(`Playing audio: ${audioFile}`);

		let streamOptions: StreamOptions = { volume };
		if (request.seek) streamOptions.seek = request.seek;

		const dispatcher = connection.play(audioFile, streamOptions);
		activityLog.set(channel.id, Date.now());

		dispatcher.on('start', () => {
			console.log(`${file} is now playing!`);
		});

		// TODO handle errors appropriately
		dispatcher.on('error', console.error);

		dispatcher.on('finish', () => {
			console.log('Finished playing!');

			dispatcher.destroy(); // end the stream
			return true;
		});
	}
	catch (error) {
		console.error(error);
		return false;
	}
}

export function disconnectAll() {
	for (const connection of bot.voice.connections.values()) {
		connection.disconnect();
	}
	activityLog.clear();
}

export function leaveVoiceChannel(id: string): void {
	const channel = bot.voice.connections.get(id);
	if (!channel) return null;

	activityLog.delete(id);
}

export function shutdown() {
	bot.once('disconnect', () => {
		console.info('Discord bot disconnected.');
	});

	disconnectAll();
	bot.destroy();
}

bot.login(process.env.TOKEN);