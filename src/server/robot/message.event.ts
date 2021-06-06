import { Message } from 'discord.js';

import { bot } from 'server/bot';

const prefix = process.env.COMMAND_PREFIX || '/';

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

	const args = message.content.toLowerCase()
		.slice(prefix.length)
		.trim().split(/ +/);

	const commandName = args.shift();

	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	try {
		await Promise.resolve(command.execute(message, args));
	} catch (error) {
		console.error(`Error executing command '${commandName}: ${error}`);
		await message.reply(`Unable to execute command :flushed:`);
	}
};
