import 'dotenv/config';

import {
    createApp,
    useBase
} from 'h3';
import { cdnRouter } from './cdn.js';

const cdnApp = createApp().use(process.env.API_PREFIX, useBase(process.env.API_PREFIX, cdnRouter.handler));

export default cdnApp;
