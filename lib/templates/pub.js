/* jshint node:true */
/* global require */
/* global exports */
'use strict';

var pub      = require('./rep');

pub._broadcast = function _broadcast (data, socket) {

  if (data) {
    socket.listener.sockets.emit(socket.options.rootHash + '_broadcast', data);
  }
};

module.exports = pub;
