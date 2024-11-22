import alertStore from '../util/alertStore.js';

export default {
    async sendMessage(ticket, messageContent, authorId) {
        // Get the list of alerts for the ticket
        const alertIDs = await alertStore.getAlerts(ticket.id);
        
        // If there are alerts, include user pings in the message
        if (alertIDs.length > 0) {
            let pings = 'Alert: ';
            alertIDs.forEach(userID => {
                pings += `<@${userID.user_id}> `;
            });
            ticket.send(`<@${authorId}>: ${messageContent}\n\n${pings}`);
            alertStore.removeAlerts(ticket.id); // Clear alerts after sending
        } else {
            // If no alerts, just send the message without pings
            ticket.send(`<@${authorId}>: ${messageContent}`);
        }
    }
}