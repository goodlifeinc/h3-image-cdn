'use strict';

var path = require('path');
var url = require('url');
var h3 = require('h3');
var unstorage = require('unstorage');
var fsLiteDriver = require('unstorage/drivers/fs-lite');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('storage.cjs', document.baseURI).href)));
const __dirname$1 = path.dirname(__filename$1);

const storage = unstorage.createStorage({
    driver: fsLiteDriver({
        base: path.join(__dirname$1, process.env.TEMP_DIR || '../tmp')
    })
});

var storage$1 = h3.defineEventHandler({
    handler: (event) => {
        event.context = {
            ...event.context,
            storage
        };
    }
});

module.exports = storage$1;
