import { model, Schema } from 'mongoose';

// Define the schema for alert store
const alertSchema = new Schema({
    ticket_id: {
        type: String, // Channel ID for the ticket channel
        required: true
    },
    user_ids: [
        {
            user_id: {
                type: String, // User ID for the staff member who executed the command
                required: true
            }
        }
    ]
});

const Alert = model('Alert', alertSchema);

export default Alert;