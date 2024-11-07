import fs from 'fs';

// Recursively get all files in a directory and its subdirectories with a specific suffix
const getFiles = (dir, suffix) => {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });

    let commandFiles = [];

    for (const file of files) {
        if (file.isDirectory()) {
            // If it's a directory, recursively gather files within it
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`, suffix)
            ];
        } else if (file.name.endsWith(suffix)) {
            // If it matches the suffix, add it to the list
            commandFiles.push(`${dir}/${file.name}`);
        }
    }

    return commandFiles;
}

export default getFiles;