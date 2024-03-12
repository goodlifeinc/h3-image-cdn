import { listen } from 'listhen';
import {
    createApp,
    defineEventHandler,
    defineResponseMiddleware,
    eventHandler,
    getRequestHeader,
    getResponseHeaders,
    setResponseHeaders,
    setResponseStatus,
    toNodeListener
} from 'h3';
import {
    createIPX,
    ipxFSStorage,
    ipxHttpStorage,
    createIPXH3Handler
} from 'ipx';
import { createStorage } from 'unstorage';
import fsLiteDriver from 'unstorage/drivers/fs-lite';

const storage = createStorage({
    driver: fsLiteDriver({ base: './tmp' })
});

const ipx = createIPX({
    storage: ipxFSStorage({ dir: '../' }),
    httpStorage: ipxHttpStorage({ allowAllDomains: true })
});

const app = createApp().use(
    '/',
    defineEventHandler({
        onBeforeResponse: defineResponseMiddleware((event, response) => {
            if (response.body && !response.body?.error) {
                // Do anything you want here like logging, collecting metrics, or output compression, etc.
                storage.setItemRaw(
                    event.path,
                    response.body
                );
                storage.setItem(
                    event.path + '-headers',
                    getResponseHeaders(event)
                );
            }
            // Never return anything from onResponse to avoid to close the connection
        }),
        handler: eventHandler(async(event) => {
            const hasItem = await storage.hasItem(event.path);
            if (hasItem) {
                const item = await storage.getItemRaw(event.path);
                setResponseHeaders(
                    event,
                    await storage.getItem(event.path + '-headers')
                );
                const pragma = getRequestHeader(event, 'Pragma');
                setResponseStatus(event, pragma === 'no-cache' ? 200 : 304);
                return item;
            }
            const handler = createIPXH3Handler(ipx);
            return handler(event);
        })
    })
);

listen(toNodeListener(app));
