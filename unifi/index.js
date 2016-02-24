function Unifi(opts, log4js) {
  var log    = log4js.getLogger('unifi');

  var config = {
    controller: opts.controller || 'unifi',
    username: opts.username || 'admin',
    password: opts.password || '',
    port: opts.port || '8443',
    version: opts.version || 'v3',
    siteid: opts.siteid || 'default'
  };
}

module.exports = Unifi;

