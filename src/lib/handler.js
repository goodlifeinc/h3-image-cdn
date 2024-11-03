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

import { headerKey, key } from './key.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getImagesDir = () => {
    if (process.env.IMAGES_DIR) {
        if (process.env.IMAGES_DIR.startsWith('.')) {
            return join(__dirname, process.env.IMAGES_DIR);
        }
        return process.env.IMAGES_DIR;
    }
    return join(__dirname, '../../images');
}

const ipx = createIPX({
    storage: ipxFSStorage({
        dir: getImagesDir()
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
    if (process.env.PREFIX_WITH_DOMAIN && JSON.parse(process.env.PREFIX_WITH_DOMAIN) === true) {
        const parts = event.path.split('/').filter(Boolean);
        const ipxOptsLength = parts[0].length + 1; // mind the leading /
        const ipxOpts = event.path.substring(0, ipxOptsLength);
        const rest = event.path.substring(ipxOptsLength);
        const domainPrefix = `/${process.env.DOMAIN_PREFIX}`;
        if (!rest.startsWith(domainPrefix)) {
            event._path = [ipxOpts, domainPrefix, rest].join('');
            event.node.req.url = event._path;
        }
    }
    const hasItem = await event.context.storage.hasItem(key(event));
    if (hasItem) {
        const item = await event.context.storage.getItemRaw(key(event));
        const headers = await event.context.storage.getItem(headerKey(event));
        setResponseHeaders(event, headers);
        const ifNoneMatch = getRequestHeader(event, 'If-None-Match');
        const isCache = ifNoneMatch === headers.etag;
        setResponseStatus(event, isCache ? 304 : 200);
        return isCache ? null : item;
    }
    return ipxHandler(event);
});
