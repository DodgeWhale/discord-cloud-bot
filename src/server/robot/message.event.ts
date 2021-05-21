import { Message } from 'discord.js';

import { bot } from 'server/bot';

const prefix = process.env.PREFIX || '/';

async function handleDirectMessage(message: Message) {

	if (message.author.bot) return;

	await message.channel.send('Ay-up :duck:');
}

export default async function handleMessage(message: Message) {
	if (message.author.bot) return;

	// Direct message channel
	if (message.channel.type === 'dm') return (await handleDirectMessage(message));

	if (message.mentions.members.has(bot.user.id)) {
		console.info(`I was mentioned!`);
	}

	// Check message is type: command
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!bot.commands.has(command)) return;

	try {
		await Promise.resolve(bot.commands.get(command).execute(message, args));
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
};
