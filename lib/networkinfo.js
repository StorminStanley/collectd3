'use strict';

var _ = require('lodash')
  , config = require('mech-config')
  , rrdhelpers = require('./rrdhelpers.js');

/**
 * Network Card Interface
 */

module.exports = function (req, res, next) {
  var now = config.server['last-timestamp'] || Math.round(new Date().getTime() / 1000);
  var period = {
    from: now - 86400,
    to: now,
    resolution: 86400
  };
  
  rrdhelpers.fetchAll("interface/if_octets-vlan11.rrd", "AVERAGE", period)(function (err, data) {
    if (err) {
      next(err);
    } else {
      res.json({
        heatmap: _.map(data, function (e, host) {
          return {
            key: host,
            value: _(e).map(function (e) {
              return e.rx + e.tx;
            }).reduce(function (a, b) {
              return a + b;
            })
          };
        })
      });
    }
  });
};