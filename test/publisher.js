// testing
var zmqLib = require('../lib/socket.protocol.ws.js'),
    service = {
      name: 'zmqTest'
    },
    client = {
      name: 'client',
      pattern: 'sub'
    },
    server = {
      name: 'server',
      pattern: 'pub',
      format: 'packet.format.latencies',
      port: [22000, 22001]
    };


/*
var socket = new Socket(server);

socket.on('listen', function (url) {
  console.log('Process "' + process.pid + '" listening on ' + url);
})
*/

var socket = zmqLib(server);


setInterval(function () {
    console.log('--------------');
    console.log('sending: ', {pid:process.pid,timestamp: new Date().toISOString()});
  socket.broadcast({requester: new Date().toISOString()});
}, 1000);
