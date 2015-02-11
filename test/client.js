// testing
var zmqLib = require('../lib/socket.protocol.http.js'),
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
      port: 22000
    };


/*
 var socket = new Socket(server);

 socket.on('listen', function (url) {
 console.log('Process "' + process.pid + '" listening on ' + url);
 })
 */

var socket = zmqLib(client);

socket.on('message', function (packet, clusterSource) {
  console.log('<<<<<<<<<<<<<<<<<<<<<');
  console.log('response at : ', new Date().toISOString(), 'from', clusterSource, packet);
});

socket.connect(server);
//socket.connect(server.protocol+'://localhost:'+22001);

setInterval(function () {
    console.log('--------------');
    console.log('sending: ', {timestamp: new Date().toISOString()});
  socket.send({requester: new Date().toISOString()});
}, 1000);
