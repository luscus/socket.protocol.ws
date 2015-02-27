/* jshint node:true */
/* global require */
/* global exports */
'use strict';

var model    = require('socket.base').models.server;
var SocketIO = require('socket.io');

var requestLib = require('../tools/request');

exports._requestHandler = null;

exports._close         = function _close () {
  this.listener.close();
};

exports._init = function _init (_options) {
  var _socket = this.parent;

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

  _socket.listener.on('connection', function connectionHandler (connection) {
    connection.parent = _socket;

    connection.on(_socket.options.rootHash + '_req', requestLib.handler.bind(connection));
    connection.on('error', function (error) {
      model.handleError.bind(_socket)(error);
    });
  });


  return _socket.listener;
};

exports._bind = function _bind (_callback) {
  this._requestHandler = _callback;
};


exports._respond = function _respond (packet, connection) {
  var socket = connection.parent;

  connection.emit(socket.options.rootHash + '_rep', packet);
};
