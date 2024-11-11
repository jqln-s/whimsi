export default {
    data: {
        name: ['reply', 'r']
    },
    async execute(message) {
        const mainServer = message.client.guilds.cache.get(process.env.GUILDID);

        // Get the response message
        const args = message.content.split(' ');
        args.shift();

        const response = args.join(' ');
        
        // Retrieve the user associated with the ticket channel (stored in the channel's topic)
        let user = message.client.users.cache.get(message.channel.topic);
        if (!user) {
            user = await mainServer.members.fetch(message.channel.topic);
        }
        
        // Send the response to the user (mentioning the user and including the response)
        user.send(`**[${message.member.roles.highest.name}]** <@${message.author.id}>: ${response}`);
        
        // Reply to the interaction with the same response, visible to the user who executed the command
        await message.reply(`**${message.author.username}**: ${response}`);
    }        
}