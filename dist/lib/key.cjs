'use strict';

const key = (event) => event.path;
const headerKey = (event) => `${key(event)}-headers`;

exports.headerKey = headerKey;
exports.key = key;
