import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { defineEventHandler } from 'h3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getPath = (dir) => {
    if (dir.startsWith('.')) {
        return join(__dirname, dir);
    }
    return dir;
};

export default (config) =>
    defineEventHandler({
        handler: (event) => {
            const tempDirPath = getPath(config.tempDir);
            const imagesDirPath = getPath(config.imagesDir);
            event.context = {
                ...event.context,
                config: {
                    ...config,
                    tempDirPath,
                    imagesDirPath
                }
            };
        }
    });
