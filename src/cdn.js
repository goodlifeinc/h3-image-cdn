import {
    createError,
    createRouter,
    defineEventHandler,
    defineResponseMiddleware,
    eventHandler,
    getRequestHeader,
    getResponseHeaders,
    setResponseHeaders,
    setResponseStatus
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
    driver: fsLiteDriver({ base: join(__dirname, process.env.TEMP_DIR || '../tmp') })
});

const ipx = createIPX({
    storage: ipxFSStorage({ dir: join(__dirname, process.env.IMAGES_DIR || '../images') }),
    httpStorage: ipxHttpStorage({ ...process.env.DOMAINS ? { domains: process.env.DOMAINS.split(';') } : { allowAllDomains: true } })
});
const ipxHandler = createIPXH3Handler(ipx);

export const cdnHandler = defineEventHandler({
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
        const allowedConversions = process.env.ALLOWED_CONVERSIONS?.split?.(';');
        if (allowedConversions?.length && !allowedConversions.some(c => event.path.startsWith(c))) {
            throw createError('Invalid conversion');
        }
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
});

export const cdnRouter = createRouter().use(
    '/**',
    cdnHandler
);
