import { Events, EmbedBuilder } from 'discord.js';
import alertStore from '../util/alertStore.js';

export default async (client) => {
    // Fetch the servers by ID
    const staffServer = client.guilds.cache.get(process.env.STAFFID);
    const mainServer = client.guilds.cache.get(process.env.GUILDID);

    client.on(Events.MessageCreate, async (message) => {
        // DMs only
        if (message.guild || message.author.bot) return;

        // Check if there's an existing ticket channel for this user (based on channel topic)
        const existingTicket = staffServer.channels.cache.find(
            channel => channel.topic == message.author.id && channel.parentId == "1302439814007619678"
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

            return;
        }

        // New ticket
        let member = mainServer.members.cache.get(message.author.id);
        if (!member) {
            member = await mainServer.members.fetch(message.author.id);
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
                        '**Reply:** Use /reply (message) to reply\n' +
                        '**Alert:** Use /alert to get a ping when the user responds\n' +
                        '**Close:** Use /close <duration> to close the ticket'
                }
            )
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
        await staffServer.channels.create({
            name: message.author.username,  // Channel name as the user's username
            parent: '1302439814007619678',  // Parent category ID
            topic: message.author.id  // Channel topic set to user ID
        }).then((channel) => {
            // Send a confirmation message to the user who opened the ticket
            message.channel.send({ embeds: [thumbnailEmbed, userEmbed] });
            // Send the staff embed in the new ticket channel
            channel.send({ embeds: [thumbnailEmbed, staffEmbed] });
            channel.send(`<@${message.author.id}>: ${message.content}`);
        });
    });

    function calculateTime(timestamp) {
        // Calculate the difference between the current time and the provided timestamp
        const timeSince = Date.now() - timestamp;
        
        // Calculate the time in various units
        const seconds = Math.floor(timeSince / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
    
        // Return an object containing the time breakdown
        return {
            years,
            months: months % 12,  // Months in the current year (0-11)
            weeks: weeks % 4,     // Weeks in the current month (0-3)
            days: days % 7,       // Days in the current week (0-6)
            hours: hours % 24,    // Hours in the current day (0-23)
            minutes: minutes % 60, // Minutes in the current hour (0-59)
            seconds: seconds % 60 // Seconds in the current minute (0-59)
        };
    }
    
    function formatTime(timeObj) {
        // Define the time units in order (year, month, week, day, etc.)
        const units = [
            { label: 'year', value: timeObj.years },
            { label: 'month', value: timeObj.months },
            { label: 'week', value: timeObj.weeks },
            { label: 'day', value: timeObj.days },
            { label: 'hour', value: timeObj.hours },
            { label: 'minute', value: timeObj.minutes },
            { label: 'second', value: timeObj.seconds },
        ];
    
        // Find the first non-zero time unit and create a "top fields" array (e.g., years, months, and weeks)
        const firstIndex = units.findIndex(unit => unit.value > 0);
        const topFields = units.slice(firstIndex, firstIndex + 3);
    
        // Format the time units into a human-readable string (e.g., "2 days, 3 hours, 4 minutes")
        return topFields.map(unit => `${unit.value} ${unit.label}${unit.value !== 1 ? 's' : ''}`).join(', ');
    }
    
}