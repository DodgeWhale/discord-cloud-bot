import path from 'path';
import fs from 'fs';

import Discord, { VoiceConnection } from 'discord.js';

const client = new Discord.Client();

let connection: VoiceConnection = null;

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (message.content === 'ping') {
		message.reply('pong');
		return;
	}

	if (message.content === '!start') {
		if (message.member.voice.channel) {
			if (connection) {
				message.channel.send('Bot already connected...');
				return;
			}

			const newConnection = await message.member.voice.channel.join();
			connection = newConnection;
		} else {
			message.channel.send('You need to join a voice channel first!');
		}
	}
});

export function getFilePath(file: string) {
	if (!file) throw new Error('Invalid audio file name');

	return path.join(__dirname, '../audio/' + file);
}

// TODO make async to speed up response to POST:/audio ?
export function playAudio(file: string, volume: number = 0.2) {
	if (!connection || !connection.channel) {
		console.info('Not connected to voice channel!');
		return;
	}

	try {
		const audioFile = getFilePath(file);
		console.info(`Playing audio: ${audioFile}`);

		const dispatcher = connection.play(fs.createReadStream(audioFile), { volume });

		dispatcher.on('start', () => {
			console.log(`${file} is now playing!`);
		});

		// TODO handle errors appropriately
		dispatcher.on('error', console.error);

		dispatcher.on('finish', () => {
			console.log('Finished playing!');

			dispatcher.destroy(); // end the stream
			disconnect();
		});
	}
	catch (error) {
		console.error(error);
	}
}

export function disconnect() {
	if (!connection) return;

	connection.disconnect();
	connection = null;
}

if (!process.env.TOKEN) throw new Error('Invalid Discord Bot access token! (env vars)');
client.login(process.env.TOKEN);