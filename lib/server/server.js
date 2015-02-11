/* jshint node:true */
'use strict';

var http     = require('http');
var tools    = require('socket.lib.tools');
var model    = require('socket.model.server');
var restify  = require('restify');
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

    _socket.config.path = tools.uri.getPathString(
      _socket.config.port,
      _socket.config.sercret
    );

    _options = _options || {
      maxBodySize: 52428800,
      mapParams: false
    };

    _socket.requestHandler = _callback;

    if (!_socket.config.bind) {
      _socket.config.bind = '*';
    }

    var server = restify.createServer({
      name: root.name + ':' + _socket.config.port
    });

    _socket.listener = new SocketIO().listen(_socket.config.port);

    // needed to catch EADDRINUSE errors
    process.on('uncaughtException', function uncaughtExceptionHandler (error) {
      model.handleError.bind(_socket)(error);
    });

    _socket.listener.httpServer.on('error', function (error) {
      _socket.emit('error', _socket.uri, _socket);
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

    /*
    _socket.listener.httpServer.use(function(req, res, next) {
      var data = '';
      req.on('data', function(chunk) {
        data += chunk;
      });
      req.on('end', function() {
        req.rawBody = data;
      });

      next();
    });

    _socket.listener.httpServer.use(restify.CORS());
    _socket.listener.httpServer.use(restify.acceptParser(['application/json']));
    _socket.listener.httpServer.use(restify.bodyParser(_options));
    _socket.listener.httpServer.use(restify.queryParser());


    _socket.listener.httpServer.on('NotFound', ResponseHandler.handler.bind(_socket));           // When a client request is sent for a uri that does not exist, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 404 handler. It is expected that if you listen for this event, you respond to the client.
    _socket.listener.httpServer.on('uncaughtException', ResponseHandler.onError.bind(_socket));  // Emitted when some handler throws an uncaughtException somewhere in the chain. The default behavior is to just call res.send(error), and let the built-ins in restify handle transforming, but you can override to whatever you want here.
    */


    //var pathRegEx = new RegExp('^\/' + _socket.config.path + '\/.*$');


    _socket.listener.on('connection', function connectionHandler (socket) {
      socket.on(_socket.config.path + '_req', ResponseHandler.handler.bind(socket));
    });

    //_socket.listener.httpServer.post(pathRegEx, ResponseHandler.handler.bind(_socket));

    //_socket.listener.httpServer.listen(_socket.config.port);


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
