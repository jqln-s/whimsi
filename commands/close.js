import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import timeoutStore from '../util/timeoutStore.js'

export default {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Close ticket (General Support)')
        .addStringOption(option => 
            option.setName('timer')
                .setDescription('Time until ticket closes (e.g. 10m for 10 minutes).')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for closing')
                .setRequired(false)
        ),
        async execute(interaction) {
            if (interaction.channel.parentId != '1302439814007619678') {
                return interaction.reply('This command can only be used in general tickets.');
            }
            // Get the timer option (default to 10 seconds if not provided)
            let timer = interaction.options.getString('timer') || '10s';
            
            // Get the reason for closing the ticket (if provided)
            let reason = interaction.options.getString('reason') ? ` because: \`${interaction.options.getString('reason')}\`` : '. ';
            
            // Validate and parse the timer, defaulting to '10 seconds'
            timer = parseInt(timer) ? timer : '10s';
            let cooldown = parseInt(timer);
            let unit = 'second(s)';
            
            // Adjust cooldown based on the unit provided (m = minutes, h = hours)
            if (timer.toLowerCase().endsWith('m')) {
                cooldown = cooldown * 1000 * 60;  // Convert to milliseconds
                unit = 'minute(s)';
            } else if (timer.toLowerCase().endsWith('h')) {
                cooldown = cooldown * 1000 * 60 * 60;  // Convert to milliseconds
                unit = 'hour(s)';
            } else {
                cooldown = cooldown * 1000;  // Default to seconds
                unit = 'second(s)';
            }
        
            // Prepare embed message for the ticket close notification
            const thumbnailEmbed = new EmbedBuilder()
                .setColor(0x69e7e6)
                .setImage('https://i.imgur.com/by0LvlK.png');
        
            const userEmbed = new EmbedBuilder()
                .setColor(0x69e7e6)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
                .setDescription(
                    `This ticket has been **closed** by <@${interaction.user.id}>${reason}
                    If you have any other concerns, you can make a new ticket by dming this bot again.`)
                .setImage('https://i.imgur.com/LRS6uCl.png');
        
            // Inform the user about the time left before the ticket closes and how to cancel
            interaction.reply(
                `Ticket closing in ${parseInt(timer)} ${unit}...
                \nUse /cancel to cancel the ticket closing.`
            );

            // Set up a timeout to delete the ticket and send the closure message after the cooldown
            let timeoutID = setTimeout(() => {
                interaction.channel.delete(reason);  // Delete the ticket channel
        
                // Send the closure notification to the user (if they can be found)
                try {
                    const user = interaction.client.users.cache.get(interaction.channel.topic);
                    user.send({ embeds: [thumbnailEmbed, userEmbed] });
                } catch (e) {
                    console.error(e);  // Log any errors that occur when sending the message
                }
            }, cooldown);
        
            // Store the timeout ID associated with the channel's topic for future reference (e.g., cancel)
            timeoutStore.setTimeoutID(interaction.channel.topic, timeoutID);
        }
}