'use strict';

var _ = require('lodash')
  , async = require('async')
  , config = require('mech-config')
  , rrdhelpers = require('./rrdhelpers.js');

/**
 * Network Card Interface
 */

module.exports = function (req, res) {
  var period = {
    from: 1370557260,
    to: 1370643660,
    resolution: 86400
  };
  
  var list = _(config.client['heatmap-storage'].map(function (h) {
    var type = config.client['node-types'][h];
    return _.partial(async.parallel, _.zipObject(type.disks, _.map(type.disks, function (d) {
      return rrdhelpers.fetchAll("disk-" + d + '/disk_octets.rrd', 'AVERAGE', period, type.host);
    })));
  })).value(); // Flattened list of all [node-types] X all its [disks]
  
  async.parallel(list, function (err, data) {
    var hash = {};
    
    _(data).each(function (type) {
      _(type).each(function (disk, diskName) {
        _(disk).each(function (host, hostName) {
          var value = _(host).map(function (v) {
            return v.read + v.write;
          }).reduce(function (a, b) {
            return a + b;
          });
          hash[hostName] = hash[hostName] || {};
          hash[hostName][diskName] = value;
        });
      });
    });
    
    var result = _.map(hash, function (v, k) {
      return {
        key: k,
        value: _.reduce(v, function (a, b) {
          return a + b;
        }),
        details: v
      };
    });
    
    res.json({ heatmap: result });
  });

};