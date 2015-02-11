/* jshint node:true */
'use strict';

var restify    = require('restify');
var tools      = require('socket.lib.tools');
var model      = require('socket.model.client');
var socketio   = require('socket.io-client');



exports._send = function _send (_connection) {
  var packet = _connection.queue.next();

  if (packet) {
    tools.packet.addRequestStart(packet);

    _connection.client.emit(_connection.path + '_req', packet);
    //_connection.client.post(undefined, packet, _connection.requestHandler);

    if (_connection.queue.hasNext() && !_connection.queue.timer) {
      _connection.queue.timer = setTimeout(function () {
        _send(_connection);
      }, 4500);
    }
    else {
      _connection.queue.timer = false;
    }
  }
};

exports._usePath = true;

exports._connect = function _connect (connections) {

  var socket      = this;
  var uri;

  connections.forEach(function connectionIterator (connection) {
    uri = connection.uri;

    if (!socket.connections[uri]) {
      socket.connections[uri] = {};

      socket.connections[uri] = connection;

      socket.connections[uri].client = socketio.connect('ws://localhost:22000/');

      socket.connections[uri].client.on('connect', function(){console.log('connect', arguments)});
      socket.connections[uri].client.on('connect_error', function(){console.log('connect_error', arguments)});
      socket.connections[uri].client.on('connect_timeout', function(){console.log('connect_timeout', arguments)});
      socket.connections[uri].client.on('reconnect', function(){console.log('reconnect', arguments)});

      socket.connections[uri].onConnect = (function (connection) {
        return function onConnectHandler () {
          connection.parent.emit('connected', connection);
        };
      })(socket.connections[uri]);

      socket.connections[uri].onDisconnect = (function (connection) {
        return function onDisconnecttHandler (error) {
            console.log(connection.uri+'::connectionTest::error: ', error);
            //model.handleError.bind(connection)(error);
          connection.parent.emit('disconnected', connection);
        };
      })(socket.connections[uri]);

      socket.connections[uri].responseHandler = (function (connection) {
        return function responseHandler (packet) {

          if (packet.CONNTEST) {
            return;
          }

            tools.packet.addResponseLatency(packet);
            connection.parent.emit('message', packet, connection.uri);

            connection.queue.remove(packet);
        };
      })(socket.connections[uri]);

      // test connection
      socket.connections[uri].test = (function (connection) {
        return function connectionTest () {
          connection.client.emit(connection.path + '_req', {CONNTEST: true});
        };
      })(socket.connections[uri]);

      socket.connections[uri].client.on('connect', socket.connections[uri].onConnect.bind(socket));
      socket.connections[uri].client.on('disconnect', socket.connections[uri].onDisconnect.bind(socket));
      socket.connections[uri].client.on('connect_error', socket.connections[uri].onDisconnect.bind(socket));
      socket.connections[uri].client.on('connect_timeout', socket.connections[uri].onDisconnect.bind(socket));
      socket.connections[uri].client.on('reconnect', socket.connections[uri].onConnect.bind(socket));

      socket.connections[uri].client.on(connection.path + '_rep', socket.connections[uri].responseHandler.bind(socket));

      socket.connections[uri].test();
  }
  });
};
