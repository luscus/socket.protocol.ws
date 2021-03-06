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
      pattern: 'rep',
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

var responseCount = 0;

socket.bind(function (data, meta, raw) {

  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('data: ', data);
  console.log('meta: ', meta);

  if (responseCount === 400) {
    process.exit();
  }

  responseCount += 1;
  data.responder = new Date().toISOString();

  return data;
});
