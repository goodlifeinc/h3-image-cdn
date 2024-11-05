import 'dotenv/config';

import { toNodeListener } from 'h3';
import { listen } from 'listhen';

import cdnAppFactory from './app.js';

const cdnApp = cdnAppFactory({
    apiPrefix: process.env.API_PREFIX,
    tempDir: process.env.TEMP_DIR,
    allowedConversions: process.env.ALLOWED_CONVERSIONS,
    prefixWithDomain: process.env.PREFIX_WITH_DOMAIN,
    domainPrefix: process.env.DOMAIN_PREFIX,
    allowedDomains: process.env.DOMAINS,
    imagesDir: process.env.IMAGES_DIR
});

listen(toNodeListener(cdnApp));
