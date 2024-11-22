import alertStore from '../util/alertStore.js';

export default {
    data: {
        name: ['alert', 'a'],
        deleteMessage: true
    },
    async execute(message) {
        try {
            // Register the user's alert in the alert store
            const alertList = await alertStore.addAlert(message.channel.id, message.author.id);

            if (!alertList || !Array.isArray(alertList.user_ids)) {
                // Log error for debugging
                console.error('Alert store returned an invalid response:', alertList);
                return message.channel.send(`Error adding **${message.author.username}** to alert list.`);
            }

            // Check if the user was successfully added to the alert list
            const isUserAdded = alertList.user_ids.some(user => user.user_id === message.author.id);

            if (isUserAdded) {
                return message.channel.send(`Pinging **${message.author.username}** on the next update.`);
            }

            // Fallback error if the user was not found in the updated list
            return message.channel.send(`Error adding **${message.author.username}** to alert list.`);
        } catch (error) {
            console.error('Error executing alert command:', error);
            return message.channel.send(`An unexpected error occurred while processing your request.`);
        }
    }
};