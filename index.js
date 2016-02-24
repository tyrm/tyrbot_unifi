// Load Config
var config = require('./config');

// Load Modules
var amqp   = require('amqplib/callback_api'),
    log4js = require('log4js'),
    redis  = require('redis');

// Init Logging
log4js.configure('', config.l4j);
var log    = log4js.getLogger();
var rdsLog = log4js.getLogger('redis');
