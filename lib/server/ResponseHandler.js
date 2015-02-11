/* jshint node:true */
'use strict';

var ErrorHandler = require('./ErrorHandler');
var tools        = require('socket.lib.tools');
var model        = require('socket.model.server');


exports.onMessage = function onMessage (packet, connection, socket) {

  if (packet) {

    var data;

    try {
      packet.data = socket.requestHandler(packet.data);
    }
    catch (ex) {
      packet.data = {error: ex.message, stack: ex.stack};
    }

    socket.respond(packet, connection, socket);
  }
  else {
    socket.respond({reason: 'no data was provided'}, connection, socket);
  }
};

exports.onError   = function onError (request, response, route, error) {
  var connection = this;
  var socket     = connection.server.parent;

  if (ErrorHandler[error.code]) {
    ErrorHandler[error.code](socket, request, response);
  }
  else {
    socket.emit('error', error, socket.uri, socket);
    socket.respond({error: error.message, stack: error.stack}, connection, socket);
  }
};

exports.handler   = function handler (packet) {
  var connection = this;
  var socket     = connection.server.parent;

  if (packet.CONNTEST) {
    socket.respond({CONNTEST:true}, connection, socket);
    return;
  }

  tools.packet.addResponseStart(packet);

  exports.onMessage(packet, connection, socket);
};
