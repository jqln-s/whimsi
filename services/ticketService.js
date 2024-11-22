import TicketLog from '../schemas/ticketLog.js';

export default {
    // Function to update an existing ticket log with a new message
    async updateTicketLog(userId, username, content) {
        try {
            // Find and update the ticket log for the given user and ticket type, pushing the new message into the log
            await TicketLog.findOneAndUpdate(
                { user_id: userId, ticket_type: process.env.BOT_TYPE, open: true },
                {
                    $push: {
                        messages: { user_id: userId, username: username, message: content }
                    }
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error while updating ticket log: ' + error);
        }
    },

    // Function to create a new ticket log for a user
    async createTicketLog(userId, username, content) {
        try {
            // Create a new ticket log with initial message and details
            const ticketLog = new TicketLog({
                user_id: userId,
                messages: [{ user_id: userId, username: username, message: content }],
                ticket_type: process.env.BOT_TYPE,
                open: true
            });
            await ticketLog.save();
        } catch (error) {
            console.error('Error while making ticket log: ' + error);
        }
    }
};