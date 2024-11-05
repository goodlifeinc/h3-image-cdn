import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { defineEventHandler } from 'h3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getImagesDir = (config) => {
    if (config.imagesDir.startsWith('.')) {
        return join(__dirname, config.imagesDir);
    }
    return config.imagesDir;
};

export default (config) =>
    defineEventHandler({
        handler: (event) => {
            const tempDirPath = join(__dirname, config.tempDir);
            const imagesDirPath = getImagesDir(config);
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
