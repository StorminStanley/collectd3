'use strict';

// Node.js backend for the app
var express = require('express')
  , config = require('mech-config').server
  , app = express();

//body parser next, so we have req.body
app.use(express.bodyParser());

// simple logger middleware
app.use(function (req, res, next) {
  console.log("Received %s %s:", req.method, req.url);
  if (req.method === "POST") { console.log(req.body); }
  if (req.query.length > 0) { console.log(req.query); }
  next();
});

// static first, to ignore logging static requests
app.use(express['static'](__dirname + '/' + config['static-directory']));

app.use(express.errorHandler({dumpExceptions: true }));

app.get('/config', require('./lib/configinfo.js'));
app.get('/data/load', require('./lib/loadinfo.js'));
app.get('/data/memory', require('./lib/memoryinfo.js'));
app.get('/data/storage', require('./lib/storageinfo.js'));
app.get('/data/network', require('./lib/networkinfo.js'));
app.get('/data/aggregate', require('./lib/aggregate.js'));
app.get('/data/:id/info', require('./lib/hostinfo.js'));
app.get('/data/:id/graph', require('./lib/hostgraph.js'));

app.listen(config.port);
console.log('Express listening on port ' + config.port);
console.log('Serving static content from: ' + __dirname + '/' + config['static-directory']);