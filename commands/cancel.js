import timeoutStore from '../util/timeoutStore.js'

export default {
    data: {
        name: ['cancel']
    },
    execute(message) {
        // Check if there is an active timeout associated with the channel's topic
        if (timeoutStore.getTimeoutID(message.channel.topic)) {
            // Clear the timeout if it exists
            timeoutStore.clearTimeoutID(message.channel.topic);
            // Notify the user that the timeout was cancelled
            message.reply('Timeout cancelled!');
        } else {
            // Inform the user if no active timeout was found
            message.reply('No active timeout found for this ticket.');
        }
    }
}