import Alert from '../schemas/alert.js';

export default {
    async addAlert(ticket_id, user_id) {
        // Add user to the alert list for ticket
        return await Alert.findOneAndUpdate(
            {
                ticket_id
            },
            {
                $push: {
                    user_ids: {
                        user_id
                    }
                }
            },
            {
                upsert: true,
                new: true
            }
        );
    },

    async getAlerts(ticket_id) {
        // Retrieve the user IDs for a specific channel's alerts
        const alerts = await Alert.findOne({ ticket_id });
        if (alerts) {
            return alerts.user_ids;
        } else {
            return [];
        }
    },

    async removeAlerts(ticket_id) {
        // Remove all alerts for a channel after they have triggered
        return await Alert.deleteOne({ ticket_id });
    }
};