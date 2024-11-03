import { createRouter, defineEventHandler } from 'h3';

import onBeforeResponse from './lib/beforeResponse.js';
import handler from './lib/handler.js';

export const cdnHandler = defineEventHandler({
    onBeforeResponse,
    handler
});

export const cdnRouter = createRouter().use('/**', cdnHandler);
