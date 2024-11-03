'use strict';

require('dotenv/config');
var h3 = require('h3');
var cdn = require('./cdn.cjs');
var storage = require('./storage.cjs');

const cdnApp = h3.createApp();
cdnApp.use(storage);

(() => {
    if (process.env.API_PREFIX) {
        cdnApp.use(
            process.env.API_PREFIX,
            h3.useBase(process.env.API_PREFIX, cdn.cdnRouter.handler)
        );
        return;
    }
    cdnApp.use(cdn.cdnRouter);
})();

module.exports = cdnApp;
