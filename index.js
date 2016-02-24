// Load Config
var config = require('./config');

// Load Modules
var amqp   = require('amqplib/callback_api'),
    log4js = require('log4js'),
    redis  = require('redis');
