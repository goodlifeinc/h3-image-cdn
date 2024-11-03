import { toNodeListener } from 'h3';
import { listen } from 'listhen';

import cdnApp from './app.js';

listen(toNodeListener(cdnApp));
