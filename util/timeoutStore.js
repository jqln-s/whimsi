const timeouts = {};  // Store active timeouts by a unique key

export default {
    // Set a timeout ID for a specific key (e.g., channel/topic ID)
    setTimeoutID(key, id) {
        timeouts[key] = id;
    },

    // Retrieve the timeout ID associated with a specific key
    getTimeoutID(key) {
        return timeouts[key];
    },

    // Clear the timeout associated with a specific key and delete the entry
    clearTimeoutID(key) {
        if (timeouts[key]) {
            clearTimeout(timeouts[key]);  // Cancel the timeout
            delete timeouts[key];  // Remove the timeout from the store
        }
    },

    // Clear all active timeouts and remove them from the store
    clearAllTimeouts() {
        for (const key in timeouts) {
            clearTimeout(timeouts[key]);  // Cancel each timeout
            delete timeouts[key];  // Remove each timeout from the store
        }
    }
};