import Timeout from '../schemas/timeout.js';

export default {
    // Set a timeout for a specific channel
    async setTimeout(channelID, cooldown) {
        try {
            // Create a new timeout
            const timeout = new Timeout({
                ticket_id: channelID,
                execute_at: Date.now() + cooldown,
                ticket_type: process.env.BOT_TYPE
            });
            await timeout.save();
        } catch (error) {
            console.error('Error while making new timeout: ', error);
        }
    },

    // Retrieve the timeout associated with a specific channel
    async getTimeout(channelID) {
        const timeout = await Timeout.findOne({ ticket_id: channelID, ticket_type: process.env.BOT_TYPE });
        return timeout;
    },

    // Clear the timeout associated with a specific channel and delete it
    async deleteTimeout(channelID) {
        if (await this.getTimeout(channelID)) {
            try {
                await Timeout.deleteOne({ ticket_id: channelID, ticket_type: process.env.BOT_TYPE });
            } catch (error) {
                console.error('Error while deleting timeout: ', error);
            }
        }
    }
};