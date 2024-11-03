import { defineResponseMiddleware, getResponseHeaders } from 'h3';

export default defineResponseMiddleware(async(event, response) => {
    if (response.body && !response.body?.error) {
        if (!(await event.context.storage.hasItem(event.path))) {
            event.context.storage.setItemRaw(event.path, response.body);
        }
        event.context.storage.setItem(
            event.path + '-headers',
            getResponseHeaders(event)
        );
    }
});
