/* jshint node:true */
/* global require */
/* global exports */
'use strict';

var model        = require('socket.base').models.server;


exports.getMetadata = function getMetadata (connection) {

  var socket = connection.parent;
  var meta   = {};

  meta.bytesReceived   = (connection.client.conn.transport.socket ? connection.client.conn.transport.socket.bytesReceived : 0);
  meta.bytesRead       = meta.bytesReceived - socket.bytesReceived || 0;
  meta.remoteIp        = connection.client.conn.remoteAddress;

  socket.bytesReceived = meta.bytesReceived;

  return meta;
};


exports.handler   = function handler (packet) {

  var connection = this;
  var meta       = exports.getMetadata(connection);

  model.request.handler.bind(connection)(packet, meta);
};
