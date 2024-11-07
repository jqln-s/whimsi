import { Client, ActivityType, Partials, Collection, Events, GatewayIntentBits } from 'discord.js';
import runFeatures from './util/runFeatures.js';
import { config } from 'dotenv';
import getFiles from './util/getFiles.js';
import { join } from 'path';

config();

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

// Load command files from subdirectories in 'commands' and add to collection
const commandFiles = getFiles(`${import.meta.dirname}/commands`, '.js');
for (const file of commandFiles) {
    const { default: command } = await import(file);
	// Ensure each command has required properties before adding
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
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

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		// Send an error message if command execution fails
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord
client.login(process.env.TOKEN);