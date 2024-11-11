import TicketLog from '../schemas/ticketLog.js';

export default {
    data: {
        name: ['log']
    },
    async execute(message) {
        // Split the message content into arguments and remove the command itself
        const args = message.content.split(' ');
        args.shift();

        const _id = args[0];  // The ticket ID is the first and only argument

        try {
            // Try to find the ticket log by its ID in the database
            const log = await TicketLog.findById(_id);
            if (!log) {
                // If the log is not found, notify the user
                message.reply('Invalid ticket ID.');
                return;
            }

            // Construct the text from the log messages
            let txt = '';
            log.messages.forEach(msg => {
                // Format each log message with its timestamp and sender
                txt += `[${msg.timestamp.toLocaleString()}] [${msg.username}] ${msg.message}\n`;
            });

            // Convert the log text into a Buffer for file attachment
            const attachment = Buffer.from(txt, 'utf-8');

            // Send the log file as an attachment
            message.channel.send({
                files: [{
                    attachment,
                    name: `${_id}.txt`
                }]
            });

        } catch (error) {
            console.error('Error while fetching ticket log: ' + error);
        }
    }
}