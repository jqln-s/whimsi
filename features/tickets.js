import { Events, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import alertStore from '../util/alertStore.js';

export default async (client) => {
    // Fetch the staff guild by ID
    const guild = client.guilds.cache.get(process.env.STAFFID);

    client.on(Events.MessageCreate, async (message) => {
        // DMs only
        if (message.guild || message.author.bot) return;

        // Check if there's an existing ticket channel for this user (based on channel topic)
        const existingTicket = guild.channels.cache.find(
            channel => channel.topic == message.author.id
        );

        // Existing ticket

        if (existingTicket) {
            // Reply to the user's response with the same response, to ensure they know it's been sent
            message.channel.send(`**${message.author.username}**: ${message.content}`);

            // Check if there are any staff members to alert of new message
            const alertIDs = alertStore.getAlerts(existingTicket.id);
            if (alertIDs.length > 0) {
                // Construct the alert message to mention users
                let pings = 'Alert: ';
                alertIDs.forEach(userID => {
                    pings += `<@${userID}>`;
                });

                // Send the user's message with alerts
                existingTicket.send(`<@${message.author.id}>: ${message.content}\n\n${pings}`);
                alertStore.removeAlerts(existingTicket.id);  // Clear alerts after sending
            } else {
                // If no alerts, just send the user's message
                existingTicket.send(`<@${message.author.id}>: ${message.content}`);
            }

            return;
        }

        // New ticket

        // Create an embed for the thumbnail
        const thumbnailEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setImage('https://i.imgur.com/by0LvlK.png');

        // Create an embed for the staff's view of the message
        const staffEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
            .setDescription(message.content)
            .setFooter({ text: 'Use /reply to respond and /close to close the ticket.' })
            .setImage('https://i.imgur.com/LRS6uCl.png');

        // Create an embed for the user's view of the ticket confirmation
        const userEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
            .setDescription(
                '**Thank you** for opening a support ticket.\n\n' +
                'Make sure you\'ve provided us with the following information:\n' +
                '<:whimsi_arrow:1299213631397036105> The question, concern, or problem you need help with\n' +
                '<:whimsi_arrow:1299213631397036105> Your Discord username\n' +
                '<:whimsi_arrow:1299213631397036105> Your Minecraft username\n\n' +
                'Our staff team will be with you as soon as possible. Thanks for your continued patience!'
            )
            .setImage('https://i.imgur.com/LRS6uCl.png');

        // Create a new private channel for the support ticket and set permissions
        await guild.channels.create({
            name: message.author.username,  // Channel name as the user's username
            parent: '1302439814007619678',  // Parent category ID
            topic: message.author.id,  // Channel topic set to user ID
            permissionOverwrites: [
                {
                    id: guild.id,  // Deny viewing access to everyone in the guild
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]
        }).then((channel) => {
            // Send a confirmation message to the user who opened the ticket
            message.channel.send({ embeds: [thumbnailEmbed, userEmbed] });
            // Send the staff embed in the new ticket channel
            channel.send({ embeds: [staffEmbed] });
        });
    });
}