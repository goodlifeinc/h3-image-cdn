'use strict';

var h3 = require('h3');
var beforeResponse = require('./lib/beforeResponse.cjs');
var handler = require('./lib/handler.cjs');

const cdnHandler = h3.defineEventHandler({
    onBeforeResponse: beforeResponse,
    handler
});

const cdnRouter = h3.createRouter().use('/**', cdnHandler);

exports.cdnHandler = cdnHandler;
exports.cdnRouter = cdnRouter;
