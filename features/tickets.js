import { Events, EmbedBuilder } from 'discord.js';
import alertStore from '../util/alertStore.js';
import TicketLog from '../schemas/ticketLog.js';
import { calculateTime, formatTime } from '../util/timeUtils.js';

export default async (client) => {
    // Fetch the servers by ID
    const staffServer = client.guilds.cache.get(process.env.STAFF_ID);
    const mainServer = client.guilds.cache.get(process.env.GUILD_ID);

    client.on(Events.MessageCreate, async (message) => {
        // DMs only
        if (message.guild || message.author.bot) return;

        // Check if there's an existing ticket channel for this user (based on channel topic)
        const existingTicket = staffServer.channels.cache.find(
            channel => channel.topic == message.author.id && channel.parentId == process.env.CATEGORY_ID
        );

        // Existing ticket
        if (existingTicket) {
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

            // Push new messages to ticket log
            try {
                await TicketLog.findOneAndUpdate(
                    { 
                        user_id: message.author.id,
                        open: true
                    },
                    {
                        $push: {
                            messages: {
                                user_id: message.author.id,
                                username: message.author.username,
                                message: message.content
                            }
                        }
                    },
                    { 
                        upsert: true,
                        new: true
                    }
                );
            } catch (error) {
                console.error('Error while updating ticket log: ' + error);
            }

            return;
        }

        // New ticket
        let member = mainServer.members.cache.get(message.author.id);
        if (!member) {
            member = await mainServer.members.fetch(message.author.id);
        }

        // Find previous tickets
        let text = '';
            try {
                // Fetch closed ticket logs for the given user
                const logs = await TicketLog.find({ user_id: message.author.id, open: false });
                if (logs.length != 0) {
                    text = `User has ${logs.length} previous tickets. Use !logs ${message.author.id} to see them.`;
                }
            } catch (error) {
                console.error('Error while fetching ticket log: ' + error);
            }

        // Create an embed for the thumbnail
        const thumbnailEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setImage('https://i.imgur.com/by0LvlK.png');

        // Create an embed for the staff's view of the message
        const staffEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆')
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
            .addFields(
                { 
                    name: 'Joined',
                    value: `**${formatTime(calculateTime(member.joinedTimestamp))}** ago`,
                    inline: true
                },
                { 
                    name: 'User ID',
                    value: `**${message.author.id}**`,
                    inline: true
                },
                { 
                    name: '\u200B',
                    value: 
                        '**Reply:** Use !reply <message> to reply\n' +
                        '**Alert:** Use !alert to get a ping when the user responds\n' +
                        '**Close:** Use !close [duration] to close the ticket'
                }
            )
            .setImage('https://i.imgur.com/LRS6uCl.png')
            .setFooter({ text });

        // Create an embed for the user's view of the ticket confirmation
        const higherUpEmbed = new EmbedBuilder()
            .setColor(0x69e7e6)
            .setTitle('⋆｡‧˚ʚ Higher Up Support Ticket ɞ˚‧｡⋆')
            .setDescription(
                '**Thank you** for opening a higher up support ticket. Admin+ are the only ones who can see these tickets.\n\n' +
                'Make sure you\'ve provided us with the following information:\n' +
                '<:whimsi_arrow:1299213631397036105> The question, concern, or problem you need help with\n' +
                '<:whimsi_arrow:1299213631397036105> Your Discord username\n' +
                '<:whimsi_arrow:1299213631397036105> Your Minecraft username\n\n' +
                'Our higher up team will be with you as soon as possible. Thanks for your continued patience!'
            )
            .setImage('https://i.imgur.com/LRS6uCl.png');
        const generalEmbed = new EmbedBuilder()
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

        let userEmbed = '';
        if (process.env.BOT_TYPE == 'General') {
            userEmbed = generalEmbed;
        } else {
            userEmbed = higherUpEmbed;
        }
        
        // Create a new private channel for the support ticket and set permissions
        await staffServer.channels.create({
            name: message.author.username,  // Channel name as the user's username
            parent: process.env.CATEGORY_ID,  // Parent category ID
            topic: message.author.id  // Channel topic set to user ID
        }).then((channel) => {
            // Send a confirmation message to the user who opened the ticket
            message.channel.send({ embeds: [thumbnailEmbed, userEmbed] });

            // Send the staff embed in the new ticket channel
            channel.send({ embeds: [thumbnailEmbed, staffEmbed] });
            channel.send(`<@${message.author.id}>: ${message.content}`);
        });

        // Create new ticket log
        try {
            const ticketLog = new TicketLog({
                user_id: message.author.id,
                messages: [
                    {
                        user_id: message.author.id,
                        username: message.author.username,
                        message: message.content
                    }
                ],
                ticket_type: process.env.BOT_TYPE,
                open: true
            });

            await ticketLog.save();
        } catch(error) {
            console.error('Error while making ticket log: ' + error);
        }
    });
}