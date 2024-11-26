import timeoutStore from '../util/timeoutStore.js';

export default {
    data: {
        name: ['cancel'],
        deleteMessage: true
    },
    async execute(message) {
        try {
            const channelID = message.channel.id;

            // Check if a timeout exists for the current channel
            const timeout = await timeoutStore.getTimeout(channelID);

            if (timeout) {
                // Delete the active timeout
                await timeoutStore.deleteTimeout(channelID);

                // Notify the user
                return message.channel.send('Timeout cancelled!');
            }

            // Notify the user if no active timeout exists
            return message.channel.send('No active timeout found for this channel.');
        } catch (error) {
            console.error('Error cancelling timeout:', error);

            // Notify the user about the error
            return message.channel.send('An error occurred while attempting to cancel the timeout.');
        }
    }
};