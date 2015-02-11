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
      pattern: 'rep',
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
  console.log('raw:    ', raw);
  console.log('meta:   ', meta);
  console.log('data: ', data);

  if (responseCount === 400) {
    process.exit();
  }

  responseCount += 1;
  data.responder = new Date().toISOString();

  return data;
});
