/* jshint node:true */
'use strict';

var http     = require('http');
var tools    = require('socket.base').tools;
var model    = require('socket.base').models.server;
var root     = require('package.root');
var SocketIO = require('socket.io');

var ResponseHandler = require('./ResponseHandler');


var httpServerTemplate = {
  listener: null,
  requestHandler: null,

  close: function () {
    this.listener.close();
  },

  bind: function (_callback, _options) {
    var _socket = this;

    _socket.requestHandler = _callback;

    if (!_socket.config.bind) {
      _socket.config.bind = '*';
    }

    _socket.listener = new SocketIO().listen(_socket.config.port);

    // needed to catch EADDRINUSE errors
    process.on('uncaughtException', function uncaughtExceptionHandler (error) {
      model.handleError.bind(_socket)(error);
    });

    _socket.listener.httpServer.on('error', function (error) {
      _socket.emit('error', error, _socket.uri, _socket);
    });
    _socket.listener.httpServer.on('close', function (request, response, cb) {
      _socket.emit('closing', _socket.uri, _socket);
    });
    _socket.listener.httpServer.on('listening', function (request, response, cb) {
      _socket.emit('listening', _socket);
    });

    var uri = tools.net.getUri(_socket.config) + _socket.config.path + '/';

    _socket.uri             = uri;
    _socket.listener.uri    = uri;
    _socket.listener.parent = _socket;

    _socket.listener.on('connection', function connectionHandler (socket) {
      socket.on(_socket.config.path + '_req', ResponseHandler.handler.bind(socket));
    });


    return _socket.listener;
  },

  respond: function (packet, connection, socket) {

    if (!packet.CONNTEST) {
      tools.packet.addResponseTime(packet);
    }

    connection.emit(socket.config.path + '_rep', packet);
  }
};


module.exports = httpServerTemplate;
