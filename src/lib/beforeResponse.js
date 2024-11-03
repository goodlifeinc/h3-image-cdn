import { defineResponseMiddleware, getResponseHeaders } from 'h3';

import { headerKey, key } from './key.js';

export default defineResponseMiddleware(async(event, response) => {
    if (response.body && !response.body?.error) {
        if (!(await event.context.storage.hasItem(key(event)))) {
            event.context.storage.setItemRaw(key(event), response.body);
        }
        event.context.storage.setItem(
            headerKey(event),
            getResponseHeaders(event)
        );
    }
});
