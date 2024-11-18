import alertStore from '../util/alertStore.js';

export default {
    data: {
        name: ['alert']
    },
    execute(message) {
        // Register the user's alert in the channel by storing the channel ID and user ID
        alertStore.addAlert(message.channel.id, message.author.id);
    }    
}