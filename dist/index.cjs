'use strict';

var h3 = require('h3');
var listhen = require('listhen');
var app = require('./app.cjs');

listhen.listen(h3.toNodeListener(app));
