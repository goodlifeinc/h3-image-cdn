import { createApp, useBase } from 'h3';

import { cdnRouter } from './cdn.js';
import storage from './storage.js';
import config from './config.js';

const getCdnApp = ({
    apiPrefix = null,
    tempDir = '../tmp',
    allowedConversions = null,
    prefixWithDomain = false,
    domainPrefix = null,
    allowedDomains = null,
    imagesDir = '../images'
}) => {
    const cdnApp = createApp();
    cdnApp.use(
        config({
            apiPrefix,
            tempDir,
            allowedConversions,
            prefixWithDomain,
            domainPrefix,
            allowedDomains,
            imagesDir
        })
    );
    cdnApp.use(storage);

    if (apiPrefix) cdnApp.use(apiPrefix, useBase(apiPrefix, cdnRouter.handler));
    else cdnApp.use(cdnRouter);

    return cdnApp;
};

export default getCdnApp;
