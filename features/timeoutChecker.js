import Timeout from '../schemas/timeout.js';
import TicketLog from '../schemas/ticketLog.js';
import { EmbedBuilder } from 'discord.js';

export default async (client) => {
    // Check timeouts every minute
    setInterval(checkTimeout, 1000 * 60);

    // Define embeds to be sent to user
    const thumbnailEmbed = new EmbedBuilder()
        .setColor(0x69e7e6)
        .setImage('https://i.imgur.com/by0LvlK.png');
    const userEmbed = new EmbedBuilder()
        .setColor(0x69e7e6)
        .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
        .setDescription(
            'This ticket has been **closed**.\n\n' +
            'If you have further concerns, you can create a new ticket by messaging this bot again.'
        )
        .setImage('https://i.imgur.com/LRS6uCl.png');


    async function checkTimeout() {
        // Find all active timeouts with a timestamp less than the current time
        const activeTimeouts = await Timeout.find({
            execute_at: {
                $lt: Date.now()
            }
        });

        for (const timeout of activeTimeouts) {
            // Get the ticket channel
            const channel = await client.channels.cache.get(timeout.ticket_id) ||
                            await client.channels.fetch(timeout.ticket_id).catch(() => null);

            // Exit if no channel
            if (!channel) {
                console.error('Channel not found.');
                await Timeout.deleteOne({ ticket_id: timeout.ticket_id });
                return;
            }

            // Get user to send closing message
            const user = await client.users.cache.get(channel.topic) || 
                         await client.users.fetch(channel.topic).catch(() => null);

            try {
                // Send the closing message if user is found
                if (!user || !user.dmChannel) {
                    console.error('User not found.');
                } else {
                    await user.send({ embeds: [thumbnailEmbed, userEmbed] });
                }

                await channel.delete(); // Delete the ticket channel

                // Update the ticket log in the database
                await TicketLog.findOneAndUpdate(
                    {
                        user_id: channel.topic,
                        ticket_type: process.env.BOT_TYPE,
                        open: true
                    },
                    {
                        open: false
                    }
                );

                // Delete the timeout 
                await Timeout.deleteOne({ ticket_id: timeout.ticket_id });
            } catch (error) {
                console.error('Error during ticket closure:', error);
            }
        }
    }
}