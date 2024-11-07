const alerts = {};

export default {
    addAlert(channelID, userID) {
        // Initialize an array if no alerts exist for the channel yet
        if (!alerts[channelID]) {
            alerts[channelID] = [];
        }
        // Add the userID to the array for this channel
        alerts[channelID].push(userID);
    },
    getAlerts(channelID) {
        // Retrieve the array of user IDs for a specific channel's alerts
        return alerts[channelID] || [];
    },
    removeAlerts(channelID) {
        // Remove all alerts for a channel after they have triggered
        delete alerts[channelID];
    }
};