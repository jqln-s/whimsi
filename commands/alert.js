import alertStore from '../util/alertStore.js';

export default {
    data: {
        name: ['alert']
    },
    execute(message) {
        // Register the user's alert in the channel by storing the channel ID and user ID
        alertStore.addAlert(message.channel.id, message.author.id);
    
        // Reply to the user with a confirmation message, which only they can see (ephemeral)
        message.reply('I will ping you when the next new message arrives in this channel.');
    }    
}