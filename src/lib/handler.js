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

const ipxFactory = ({ context }) =>
    createIPX({
        storage: ipxFSStorage({
            dir: context.config.imagesDirPath
        }),
        httpStorage: ipxHttpStorage({
            ...(context.config.allowedDomains
                ? { domains: context.config.allowedDomains.split(';') }
                : { allowAllDomains: true })
        })
    });

const ipxHandlerFactory = (event) =>
    createIPXH3Handler(ipxFactory(event))(event);

export default eventHandler(async(event) => {
    const allowedConversions =
        event.context.config.allowedConversions?.split?.(';');
    if (
        allowedConversions?.length &&
        !allowedConversions.some((c) => event.path.startsWith(c))
    ) {
        throw createError('Invalid conversion');
    }
    if (
        event.context.config.prefixWithDomain &&
        JSON.parse(event.context.config.prefixWithDomain) === true
    ) {
        const parts = event.path.split('/').filter(Boolean);
        const ipxOptsLength = parts[0].length + 1; // mind the leading /
        const ipxOpts = event.path.substring(0, ipxOptsLength);
        const rest = event.path.substring(ipxOptsLength);
        const domainPrefix = `/${event.context.config.domainPrefix}`;
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
    return ipxHandlerFactory(event);
});
