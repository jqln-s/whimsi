import { model, Schema } from 'mongoose';

// Define the schema for ticket logs
const ticketLogSchema = new Schema({
    user_id: {
        type: String,  // User ID for the person who opened the ticket
        required: true
    },
    messages: [
        {
            user_id: {
                type: String,  // ID of the user sending the message
                required: true
            },
            username: {
                type: String,  // Username of the person sending the message
                required: true
            },
            message: {
                type: String,  // The message content itself
                required: true
            },
            timestamp: {
                type: Date,  // Timestamp for when the message was sent
                default: Date.now
            }
        }
    ],
    ticket_type: {
        type: String,  // Type of the ticket (e.g., "general", "higher up")
        required: true
    },
    open: {
        type: Boolean,  // Whether the ticket is still open or closed
        required: true
    }
});

const TicketLog = model('TicketLog', ticketLogSchema);

export default TicketLog;