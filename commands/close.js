import timeoutStore from '../util/timeoutStore.js';

export default {
    data: {
        name: ['close', 'c'],
        deleteMessage: true
    },
    async execute(message) {
        try {
            // Extract and parse the timer argument
            const args = message.content.split(' ').slice(1);
            let timerInput = args[0] || '15m';
            let cooldown = parseInt(timerInput);
            let unit = 'second(s)';

            // Check for existing timeout
            if (await timeoutStore.getTimeout(message.channel.id)) {
                return message.channel.send('Ticket is already closing!');
            }

            // Determine cooldown in milliseconds based on suffix (m = minutes, h = hours)
            if (timerInput.toLowerCase().endsWith('m')) {
                cooldown *= 1000 * 60; // Convert to milliseconds
                unit = 'minute(s)';
            } else if (timerInput.toLowerCase().endsWith('h')) {
                cooldown *= 1000 * 60 * 60; // Convert to milliseconds
                unit = 'hour(s)';
            } else {
                cooldown *= 1000; // Default to seconds
            }

            // Validate cooldown value
            if (isNaN(cooldown) || cooldown <= 0) {
                return message.channel.send('Invalid timer format');
            }

            // Notify users about the impending ticket closure
            message.channel.send(
                `Ticket closing in ${parseInt(timerInput)} ${unit}. ` +
                'Use `!cancel` to abort the ticket closing process.'
            );

            // Set timeout
            await timeoutStore.setTimeout(message.channel.id, cooldown);
        } catch (error) {
            console.error('Error executing close command:', error);
            message.channel.send('An error occurred while processing the ticket closure.');
        }
    }
};