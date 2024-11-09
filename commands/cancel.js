import { SlashCommandBuilder } from 'discord.js';
import timeoutStore from '../util/timeoutStore.js'

export default {
    data: new SlashCommandBuilder()
        .setName('cancel')
        .setDescription('Cancel the close command (General Support)'),
    execute(interaction) {
        if (interaction.channel.parentId != '1302439814007619678') {
            return interaction.reply('This command can only be used in general tickets.');
        }
        // Check if there is an active timeout associated with the channel's topic
        if (timeoutStore.getTimeoutID(interaction.channel.topic)) {
            // Clear the timeout if it exists
            timeoutStore.clearTimeoutID(interaction.channel.topic);
            // Notify the user that the timeout was cancelled
            interaction.reply('Timeout cancelled!');
        } else {
            // Inform the user if no active timeout was found
            interaction.reply('No active timeout found for this ticket.');
        }
    }
}