import { listen } from 'listhen';
import {
    toNodeListener
} from 'h3';
import cdnApp from './app.js';

listen(toNodeListener(cdnApp));
