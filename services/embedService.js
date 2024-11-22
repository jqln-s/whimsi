import { EmbedBuilder } from 'discord.js';
import { formatTime, calculateTime } from '../util/timeUtils.js';

export default {
    // Create an embed for staff with ticket details
    createStaffEmbed(message, member, text) {
        return new EmbedBuilder()
            .setColor(0x69e7e6) // Set embed color
            .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆') // Title of the embed
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() }) // Set author details
            .addFields(
                { name: 'Joined', value: `**${formatTime(calculateTime(member.joinedTimestamp))}** ago`, inline: true }, // Display how long the user has been in the server
                { name: 'User ID', value: `**${message.author.id}**`, inline: true }, // Display the user's ID
                {
                    name: '\u200B', // Empty field for formatting
                    value: '**Reply:** Use `!reply <message>` to reply\n' + 
                        '**Alert:** Use `!alert` to get a ping when the user responds\n' +
                        '**Close:** Use `!close [duration]` to close the ticket\n' +
                        '**Edit:** Use `!edit <messageNumber> <newMessage>` to edit a message\n' +
                        '**Delete:** Use `!delete <messageNumber>` to delete a message' // Command instructions
                }
            )
            .setImage('https://i.imgur.com/LRS6uCl.png') // Image in the embed
            .setFooter({ text }); // Footer with additional information
    },

    // Create an embed for the user opening a ticket
    createUserEmbed() {
        const generalEmbed = new EmbedBuilder()
            .setColor(0x69e7e6) // Set embed color
            .setTitle('⋆｡‧˚ʚ Support Ticket ɞ˚‧｡⋆') // Title of the embed
            .setDescription(
                '**Thank you** for opening a support ticket.\n\n' + 
                'Make sure you\'ve provided us with the following information:\n' +
                '<:whimsi_arrow:1299213631397036105> The question, concern, or problem you need help with\n' +
                '<:whimsi_arrow:1299213631397036105> Your Discord username\n' +
                '<:whimsi_arrow:1299213631397036105> Your Minecraft username\n\n' +
                'Our staff team will be with you as soon as possible. Thanks for your continued patience!' // User instructions
            )
            .setImage('https://i.imgur.com/LRS6uCl.png'); // Image in the embed
    
        const higherUpEmbed = new EmbedBuilder()
            .setColor(0x69e7e6) // Set embed color
            .setTitle('⋆｡‧˚ʚ Higher Up Support Ticket ɞ˚‧｡⋆') // Title of the embed
            .setDescription(
                '**Thank you** for opening a higher up support ticket. Admin+ are the only ones who can see these tickets.\n\n' +
                'Make sure you\'ve provided us with the following information:\n' +
                '<:whimsi_arrow:1299213631397036105> The question, concern, or problem you need help with\n' +
                '<:whimsi_arrow:1299213631397036105> Your Discord username\n' +
                '<:whimsi_arrow:1299213631397036105> Your Minecraft username\n\n' +
                'Our higher up team will be with you as soon as possible. Thanks for your continued patience!' // Instructions for higher-up support tickets
            )
            .setImage('https://i.imgur.com/LRS6uCl.png'); // Image in the embed
    
        // Return the appropriate embed based on the BOT_TYPE environment variable
        return process.env.BOT_TYPE === 'General' ? generalEmbed : higherUpEmbed;
    }
};