import { Message } from 'discord.js';

export interface CommandMeta {
	name: string,
	description: string,
	execute: (message: Message, args: string[]) => Promise<void> | void;
}

export enum Command {
	Start = 'start'
}