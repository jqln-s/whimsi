import { model, Schema } from 'mongoose';

// Define the schema for ticket logs
const ticketLogSchema = new Schema({
    user_id: {
        type: String,  // User ID for the person who opened the ticket
        required: true
    },
    messages: [
        {
            username: {
                type: String,  // Username of the person sending the message
                required: true
            },
            message: {
                type: String,  // The message content itself
                required: true
            },
            timestamp: {
                type: Number,  // Timestamp for when the message was sent
                default: () => Date.now()
            },
            message_number: {
                type: Number,  // Incrementing message number for staff messages
                required: false // Only present for staff messages
            },
            user_message_id: {
                type: String,
                required: false
            },
            staff_message_id: {
                type: String,
                required: false
            },
            anonymous: {
                type: Boolean,
                required: false
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