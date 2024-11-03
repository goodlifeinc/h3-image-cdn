import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { defineEventHandler } from 'h3';
import { createStorage } from 'unstorage';
import fsLiteDriver from 'unstorage/drivers/fs-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = createStorage({
    driver: fsLiteDriver({
        base: join(__dirname, process.env.TEMP_DIR || '../tmp')
    })
});

export default defineEventHandler({
    handler: (event) => {
        event.context = {
            ...event.context,
            storage
        };
    }
});
