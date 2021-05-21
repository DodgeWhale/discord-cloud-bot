import { Message } from 'discord.js';

import { joinChannel } from 'server/bot';

import { CommandMeta, Command } from '../command.interface';

const start: CommandMeta = {
	name: Command.Start,
	description: 'Starts streaming queued audio.',

	async execute(message: Message, args: string[]) {
		const { channel } = message.member.voice;

		if (channel) {
			try {
				const connection = await joinChannel(channel);

				if (!connection) {
					message.channel.send('Bot already connected.');
					return;
				}
			}
			catch (error) {
				message.channel.send('Unable to join voice channel.');
			}
		} else {
			message.channel.send('You need to join a voice channel first!');
		}
	}
}

export default start;