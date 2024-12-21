import { model, Schema } from 'mongoose';

// Define the schema for timeout store
const timeoutSchema = new Schema({
    ticket_id: {
        type: String, // Channel ID for the ticket channel
        required: true
    },
    execute_at: {
        type: Number,
        required: true
    },
    ticket_type: {
        type: String,
        required: true
    }
});

const Timeout = model('Timeout', timeoutSchema);

export default Timeout;