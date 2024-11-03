'use strict';

var path = require('path');
var url = require('url');
var h3 = require('h3');
var ipx$1 = require('ipx');
var key = require('./key.cjs');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('lib/handler.cjs', document.baseURI).href)));
const __dirname$1 = path.dirname(__filename$1);

const getImagesDir = () => {
    if (process.env.IMAGES_DIR) {
        if (process.env.IMAGES_DIR.startsWith('.')) {
            return path.join(__dirname$1, process.env.IMAGES_DIR);
        }
        return process.env.IMAGES_DIR;
    }
    return path.join(__dirname$1, '../../images');
};

const ipx = ipx$1.createIPX({
    storage: ipx$1.ipxFSStorage({
        dir: getImagesDir()
    }),
    httpStorage: ipx$1.ipxHttpStorage({
        ...(process.env.DOMAINS
            ? { domains: process.env.DOMAINS.split(';') }
            : { allowAllDomains: true })
    })
});
const ipxHandler = ipx$1.createIPXH3Handler(ipx);

var handler = h3.eventHandler(async(event) => {
    const allowedConversions = process.env.ALLOWED_CONVERSIONS?.split?.(';');
    if (
        allowedConversions?.length &&
        !allowedConversions.some((c) => event.path.startsWith(c))
    ) {
        throw h3.createError('Invalid conversion');
    }
    const hasItem = await event.context.storage.hasItem(key.key(event));
    if (hasItem) {
        const item = await event.context.storage.getItemRaw(key.key(event));
        const headers = await event.context.storage.getItem(key.headerKey(event));
        h3.setResponseHeaders(event, headers);
        const ifNoneMatch = h3.getRequestHeader(event, 'If-None-Match');
        const isCache = ifNoneMatch === headers.etag;
        h3.setResponseStatus(event, isCache ? 304 : 200);
        return isCache ? null : item;
    }
    return ipxHandler(event);
});

module.exports = handler;
