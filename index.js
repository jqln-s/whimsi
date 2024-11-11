import { Client, ActivityType, Partials, Collection, Events, GatewayIntentBits } from 'discord.js';
import runFeatures from './util/runFeatures.js';
import { config } from 'dotenv';
import getFiles from './util/getFiles.js';
import { fileURLToPath } from 'url';
import path from 'node:path';

config({ path: 'whimsi-general.env' });

// Initialize a Discord client with specific intents and partials for bot functionality
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
});

client.commands = new Collection(); // Store commands by name

// Load command files from 'commands' directory and add to collection
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandFiles = getFiles(`${__dirname}/commands`, '.js');
for (const file of commandFiles) {
    const { default: command } = await import(file);
	// Ensure each command has required properties before adding
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
		console.log(`!${command.data.name} loaded!`);
	} else {
		console.log(`[WARNING] The command file at ${file} is missing a required 'data' or 'execute' property.`);
	}
}

// Set up initial bot activity and run additional features when ready
client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
    runFeatures(client);
    client.user.setActivity('Whimsi Woods', { type: ActivityType.Watching });
});

// Log in to Discord
client.login(process.env.TOKEN);