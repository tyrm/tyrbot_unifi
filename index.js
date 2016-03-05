// Load Config
var config = require('./config');

// Load Modules
var amqp   = require('amqplib/callback_api'),
    async  = require('async'),
    log4js = require('log4js'),
    redis  = require('redis'),
    Unifi  = require('./unifi');

// Init Logging
log4js.configure('', config.l4j);
var log    = log4js.getLogger();
var rdsLog = log4js.getLogger('redis');

// init Redis
var redisClient = redis.createClient(config.redis.options);
redisClient.on('error',function(err){
  rdsLog.error(err);
});
redisClient.on('connect',function(){
  rdsLog.info('connected to %s', config.redis.options.host);
  initConnections();
});

// Globals
var amqpClient;
var unifiClient;

function initAMQP(cb) {
  redisClient.get('config:amqp:uri',function(err, reply){
    if (err) {
      cb(err);
    }
    else {
      amqp.connect(config.amqp, function(err,conn){
        amqpClient = conn;
        cb(null);
      })
    }
  });
}

function initUnifi(cb) {
  redisClient.hgetall('config:unifi',function(err, reply){
    if (err) {
      cb(err);
    }
    else {
      unifiClient = new Unifi(reply, log4js);
      cb(null);
    }
  });
}

function initConnections(){
  async.parallel(
    [
      initAMQP,
      initUnifi
    ],
    function(err, result) {
      if (err) {
        log.error(err);
        process.exit(1);
      }

      log.trace(amqpClient);
      log.trace(unifiClient);


      unifiClient.getClients(function(err, result){
        log.error(result);
      });
      //process.exit(0);
    }
  );
}


function  main() {

}
