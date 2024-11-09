//const getFiles = require('./getFiles.js');
import getFiles from './getFiles.js';
import { fileURLToPath } from 'url';
import path from 'node:path';

// Load and execute all feature files in the "features" directory
export default async (client) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const features = getFiles(`${__dirname}/../features`, '.js');
    for (const feature of features) {
        const { default: run } = await import(feature); // Import each feature module
        run(client);  // Execute the feature, passing in the client
    }
}