import { Message } from 'discord.js';

export interface CommandMeta {
	name: string,
	description: string,
	execute: (message: Message, args: string[]) => Promise<void> | void;
	aliases?: string[],
}

export enum Command {
	Start = 'start',
	Random = 'random'
}