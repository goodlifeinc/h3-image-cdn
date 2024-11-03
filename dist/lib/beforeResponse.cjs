'use strict';

var h3 = require('h3');
var key = require('./key.cjs');

var onBeforeResponse = h3.defineResponseMiddleware(async(event, response) => {
    if (response.body && !response.body?.error) {
        if (!(await event.context.storage.hasItem(key.key(event)))) {
            event.context.storage.setItemRaw(key.key(event), response.body);
        }
        event.context.storage.setItem(
            key.headerKey(event),
            h3.getResponseHeaders(event)
        );
    }
});

module.exports = onBeforeResponse;
