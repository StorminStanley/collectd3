'use strict';

var _ = require('lodash')
  , rrdhelpers = require('./rrdhelpers.js');

/**
 * Network Card Interface
 */

module.exports = function (req, res, next) {
  var period = {
    from: 1370557260,
    to: 1370643660,
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