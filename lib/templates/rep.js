/* jshint node:true */
'use strict';

var http     = require('http');
var tools    = require('socket.base').tools;
var model    = require('socket.base').models.server;
var root     = require('package.root');
var SocketIO = require('socket.io');

var ResponseHandler = require('../server/ResponseHandler');


exports.listener       = null;
exports.requestHandler = null;

exports._close         = function _close () {
  this.listener.close();
};

exports._bind = function _bind (_callback, _options) {
  var _socket = this.parent;

  _socket.requestHandler = _callback;

  if (!_socket.options.bind) {
    _socket.options.bind = '*';
  }

  _socket.listener = new SocketIO().listen(_socket.options.port);

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

  _socket.listener.uri    = _socket.uri;
  _socket.listener.parent = _socket;

  _socket.listener.on('connection', function connectionHandler (socket) {
    socket.on(_socket.options.rootHash + '_req', ResponseHandler.handler.bind(socket));
    socket.on('error', function (error) {
      model.handleError.bind(_socket)(error);
    });
  });


  return _socket.listener;
};

exports._respond = function _respond (packet, connection, socket) {

  if (!packet.CONNTEST) {
    tools.packet.addResponseTime(packet);
  }

  connection.emit(socket.options.rootHash + '_rep', packet);
};
