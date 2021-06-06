import { Message } from 'discord.js';

import { getNewOrExistingConnection } from 'server/bot';

import { CommandMeta, Command } from '../command.interface';

const start: CommandMeta = {
	name: Command.Start,
	description: 'Starts streaming queued audio.',

	async execute(message: Message, args: string[]) {
		const { channel } = message.member.voice;

		if (channel) {
			try {
				const connection = await getNewOrExistingConnection(channel);

				if (!connection) {
					message.channel.send('Bot already connected.');
					return;
				}
			}
			catch (error) {
				message.channel.send('Unable to join voice channel :thinking:');
			}
		} else {
			message.channel.send('You need to join a voice channel first! :face_with_monocle:');
		}
	}
}

export default start;