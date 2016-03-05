var https       = require('https'),
    querystring = require('querystring');

function Unifi(opts, log4js) {
  var log = log4js.getLogger('unifi');

  var config = {
    controller: opts.controller || 'unifi',
    username: opts.username || 'admin',
    password: opts.password || '',
    port: opts.port || 8443,
    version: opts.version || 'v3',
    siteid: opts.siteid || 'default'
  };

  var cookie;
  var uri  = 'https://' + config.controller + ':' + config.port.toString();
  var path = '/api/s/' + config.siteid + '/';

  log.info(uri);

  function _login(cb) {
    log.info('attemping login to unifi api as %s', config.username);

    var post_data = JSON.stringify({'username': config.username, 'password': config.password});

    var post_options = {
      hostname: config.controller,
      port: config.port,
      path: '/api/login',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_data).toString()
      }
    };

    // Set up the request
    var post_req = https.request(post_options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        cookie = res.headers["set-cookie"];
        cb(null, cookie);
      });
      res.on('error', function (chunk) {
        cb(chunk);
        log.error('Response: ' + chunk);
      });
    });

    post_req.on('error', function (chunk) {
      log.error('Response: ' + chunk);
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
  }

  function _get(path, cb) {
    var get_options = {
      hostname: config.controller,
      port: config.port,
      path: path,
      method: 'GET',
      rejectUnauthorized: false,
      headers: {
        Cookie: cookie
      }
    };

    log.trace(get_options);

    // Set up the request
    var get_req = https.request(get_options, function (res) {

      var theData = '';

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        theData += chunk;
      });

      res.on('error', function (chunk) {
        log.error('Response: ' + chunk);
        cb(chunk);
      });

      res.on('end', function() {
        var jsonRes;

        try {
          jsonRes = JSON.parse(theData);
        } catch (e) {
          log.error('JSON packet [%s] is malformed', chunk)
        }

        cb(null, jsonRes);
      })
    });

    get_req.on('error', function (chunk) {
      log.error('Response: ' + chunk);
      cb(chunk);
    });

    // post the data
    get_req.end();
  }

  function _getClients(cb) {
    _get(uri + path + 'stat/sta', cb);
  }

  this.getClients = function (cb) {
    _getClients(function(err, res){
      log.info(res);
      if (err){
        log.error(err);
      }
      else if (res.meta.rc == 'error' && res.meta.msg == 'api.err.LoginRequired') {
        _login(function(err, res) {
          _getClients(function(err,res){
            if (err) {
              log.error(err);
            }
            else {
              log.info(res);
            }
          })
        })
      }


    })
  }


}

module.exports = Unifi;
