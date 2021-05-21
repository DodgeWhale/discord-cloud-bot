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

let joinLog: Map<string, number> = new Map();

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

export function isChannelActive() {
	// TODO
}

export function getConnection(id: string): VoiceConnection {
	return bot.voice.connections.get(id);
}

export async function joinChannel(channel: VoiceChannel) {
	const { id, name } = channel;

	let existingConn = getConnection(id);
	if (existingConn) return existingConn;

	try {
		let conn = await channel.join();

		joinLog.set(id, Date.now());

		console.info(`Joined channel: ${name} (${id})`);
		return conn;
	}
	catch (error) {
		console.error(`Unable to join channel: ${name} (${id})`);
		throw error;
	}
}

const baseAudioPath = process.env.CLIPS_FOLDER || '../audio/';
export function getFilePath(file: string) {
	if (!file) throw new Error('Invalid audio file name');

	return path.join(__dirname, baseAudioPath + file);
}

export interface AudioRequest {
	voiceChannel: string,
	file: string,
	volume: number,
	seek?: number
}

// TODO make async to speed up response to POST:/audio ?
export async function playAudio(request: AudioRequest) {
	const { file, volume } = request;

	try {
		const channel = bot.channels.cache.get(request.voiceChannel) as VoiceChannel;

		// Get existing, or start a new connection
		const connection = await joinChannel(channel);

		const audioFile = getFilePath(file);
		console.info(`Playing audio: ${audioFile}`);

		let streamOptions: StreamOptions = { volume };
		if (request.seek) streamOptions.seek = request.seek;

		const dispatcher = connection.play(audioFile, streamOptions);

		dispatcher.on('start', () => {
			console.log(`${file} is now playing!`);
		});

		// TODO handle errors appropriately
		dispatcher.on('error', console.error);

		dispatcher.on('finish', () => {
			console.log('Finished playing!');

			dispatcher.destroy(); // end the stream
		});
	}
	catch (error) {
		console.error(error);
	}
}

export function disconnect() {
	for (const channelId of bot.voice.connections.keys()) {
		leaveVoiceChannel(channelId);
	}
}

export function leaveVoiceChannel(id: string): void {
	const channel = bot.voice.connections.get(id);
	if (!channel) return null;

	joinLog.delete(id);
	channel.disconnect();
}

export function shutdown() {
	bot.once('disconnect', () => {
		console.info('Discord bot disconnected.');
	});

	disconnect();
	bot.destroy();
}

if (!process.env.TOKEN) throw new Error('Invalid Discord Bot access token! (env vars)');
bot.login(process.env.TOKEN);