import 'dotenv/config';

import { createApp, useBase } from 'h3';

import { cdnRouter } from './cdn.js';
import storage from './storage.js';

const cdnApp = createApp();
cdnApp.use(storage);

(() => {
    if (process.env.API_PREFIX) {
        cdnApp.use(
            process.env.API_PREFIX,
            useBase(process.env.API_PREFIX, cdnRouter.handler)
        );
        return;
    }
    cdnApp.use(cdnRouter);
})();

export default cdnApp;
