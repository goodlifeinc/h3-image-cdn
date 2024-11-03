import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import {
    createError,
    eventHandler,
    getRequestHeader,
    setResponseHeaders,
    setResponseStatus
} from 'h3';
import {
    createIPX,
    createIPXH3Handler,
    ipxFSStorage,
    ipxHttpStorage
} from 'ipx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ipx = createIPX({
    storage: ipxFSStorage({
        dir: join(__dirname, process.env.IMAGES_DIR || '../images')
    }),
    httpStorage: ipxHttpStorage({
        ...(process.env.DOMAINS
            ? { domains: process.env.DOMAINS.split(';') }
            : { allowAllDomains: true })
    })
});
const ipxHandler = createIPXH3Handler(ipx);

export default eventHandler(async(event) => {
    const allowedConversions = process.env.ALLOWED_CONVERSIONS?.split?.(';');
    if (
        allowedConversions?.length &&
        !allowedConversions.some((c) => event.path.startsWith(c))
    ) {
        throw createError('Invalid conversion');
    }
    const hasItem = await event.context.storage.hasItem(event.path);
    if (hasItem) {
        const item = await event.context.storage.getItemRaw(event.path);
        const headers = await event.context.storage.getItem(
            event.path + '-headers'
        );
        setResponseHeaders(event, headers);
        const ifNoneMatch = getRequestHeader(event, 'If-None-Match');
        const isCache = ifNoneMatch === headers.etag;
        setResponseStatus(event, isCache ? 304 : 200);
        return isCache ? null : item;
    }
    return ipxHandler(event);
});