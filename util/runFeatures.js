//const getFiles = require('./getFiles.js');
import getFiles from './getFiles.js';

// Load and execute all feature files in the "features" directory
export default async (client) => {
    const features = getFiles(`${import.meta.dirname}/../features`, '.js');
    for (const feature of features) {
        const { default: run } = await import(feature); // Import each feature module
        run(client);  // Execute the feature, passing in the client
    }
}