// testing
var zmqLib = require('../lib/socket.protocol.ws.js'),
    service = {
      name: 'zmqTest'
    },
    client = {
      name: 'client',
      pattern: 'req'
    },
    server = {
      name: 'server',
      host: ['localhost'],
      pattern: 'rep',
      port: [22000, 22001]
    };


/*
 var socket = new Socket(server);

 socket.on('listen', function (url) {
 console.log('Process "' + process.pid + '" listening on ' + url);
 })
 */

var socket = zmqLib(client);

socket.connect(server, function (packet, clusterSource) {
  console.log('<<<<<<<<<<<<<<<<<<<<<');
  console.log('message at : ', new Date().toISOString(), 'from', clusterSource, packet);
});
//socket.connect(server.protocol+'://localhost:'+22001);
