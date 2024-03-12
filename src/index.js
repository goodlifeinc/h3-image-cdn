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
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = createStorage({
    driver: fsLiteDriver({ base: join(__dirname, '../tmp') })
});

const ipx = createIPX({
    storage: ipxFSStorage({ dir: join(__dirname, '../images') }),
    httpStorage: ipxHttpStorage({ allowAllDomains: true })
});
const ipxHandler = createIPXH3Handler(ipx);

const app = createApp().use(
    '/',
    defineEventHandler({
        onBeforeResponse: defineResponseMiddleware(async(event, response) => {
            if (response.body && !response.body?.error) {
                if (!(await storage.hasItem(event.path))) {
                    storage.setItemRaw(event.path, response.body);
                }
                storage.setItem(
                    event.path + '-headers',
                    getResponseHeaders(event)
                );
            }
        }),
        handler: eventHandler(async(event) => {
            const hasItem = await storage.hasItem(event.path);
            if (hasItem) {
                const item = await storage.getItemRaw(event.path);
                const headers = await storage.getItem(event.path + '-headers');
                setResponseHeaders(event, headers);
                const ifNoneMatch = getRequestHeader(event, 'If-None-Match');
                const isCache = ifNoneMatch === headers.etag;
                setResponseStatus(event, isCache ? 304 : 200);
                return isCache ? null : item;
            }
            return ipxHandler(event);
        })
    })
);

listen(toNodeListener(app));
