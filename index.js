// Load Config
var config = require('./config');

// Load Modules
var amqp   = require('amqplib/callback_api'),
    log4js = require('log4js'),
    redis  = require('redis'),
    Unifi  = require('./unifi');

// Init Logging
log4js.configure('', config.l4j);
var log    = log4js.getLogger();
var rdsLog = log4js.getLogger('redis');

// init Redis
var redisClient = redis.createClient(config.redis.options);

redisClient.on('connect',function(){
  rdsLog.info('connected to %s', config.redis.options.host);
});
redisClient.on('error',function(err){
  rdsLog.error(err);
});

// init Unifi connection
var unifi;
redisClient.hgetall('config:unifi',function(err, reply){
  if (err) {rdsLog.error(err)}
  rdsLog.debug(reply);
  unifi = Unifi(reply, log4js);
});