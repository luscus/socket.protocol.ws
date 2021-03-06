/* jshint node:true */
/* global require */
/* global exports */
'use strict';

var model      = require('socket.base').models.client;
var socketio   = require('socket.io-client');


exports._init = function _init () {
  return this.parent;
};

exports._send = function _send (packet, _connection) {
  _connection.client.emit(_connection.rootHash + '_req', packet);
};

exports._usePath = false;

exports._connect = function _connect (connections, callback) {

  var socket      = this.parent;
  var uri;

  connections.forEach(function connectionIterator (connection) {
    uri = connection.uri;

    if (!socket.connections[uri]) {
      socket.connections[uri] = {};

      socket.connections[uri] = connection;

      socket.connections[uri].client = socketio.connect(uri);

      socket.connections[uri].onConnect = (function (connection) {
        return function onConnectHandler () {
          connection.parent.emit('connected', connection);
        };
      })(socket.connections[uri]);

      socket.connections[uri].onDisconnect = (function (connection) {
        return function onDisconnecttHandler (error) {
            //console.log(connection.uri+'::connectionTest::error: ', error);
            //model.handleError.bind(connection)(error);
          connection.parent.emit('disconnected', connection);
        };
      })(socket.connections[uri]);

      socket.connections[uri].responseHandler = (function (connection) {
        return function responseHandler (data) {
          model.response.handler(data, connection);
        };
      })(socket.connections[uri]);

      socket.connections[uri].broadcastHandler = (function (clusterSource) {
        return function broadcastHandler (data) {

          return callback(data, clusterSource);
        };
      })(uri);

      // test connection
      socket.connections[uri].test = (function (connection) {
        return function connectionTest () {
          connection.client.emit(connection.rootHash + '_req', {CONNTEST: true});
        };
      })(socket.connections[uri]);

      socket.connections[uri].client.on('connect', socket.connections[uri].onConnect.bind(socket));
      socket.connections[uri].client.on('disconnect', socket.connections[uri].onDisconnect.bind(socket));
      socket.connections[uri].client.on('connect_error', socket.connections[uri].onDisconnect.bind(socket));
      socket.connections[uri].client.on('connect_timeout', socket.connections[uri].onDisconnect.bind(socket));
      socket.connections[uri].client.on('reconnect', socket.connections[uri].onConnect.bind(socket));

      socket.connections[uri].client.on(connection.rootHash + '_rep', socket.connections[uri].responseHandler.bind(socket));
      socket.connections[uri].client.on(connection.rootHash + '_broadcast', socket.connections[uri].broadcastHandler.bind(socket));

      socket.connections[uri].test();
  }
  });
};
