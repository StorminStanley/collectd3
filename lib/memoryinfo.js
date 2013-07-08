'use strict';

var _ = require('lodash')
  , async = require('async')
  , rrdhelpers = require('./rrdhelpers.js');

/**
 * Memory Card Interface
 */

module.exports = function (req, res, next) {
  async.parallel({
    used: rrdhelpers.extractAll("memory/memory-used.rrd", {
      value: "ds[value].last_ds",
      last_update: "last_update"
    }),
    free: rrdhelpers.extractAll("memory/memory-free.rrd", {
      value: "ds[value].last_ds",
      last_update: "last_update"
    }),
    cached: rrdhelpers.extractAll("memory/memory-cached.rrd", {
      value: "ds[value].last_ds",
      last_update: "last_update"
    }),
    buffered: rrdhelpers.extractAll("memory/memory-buffered.rrd", {
      value: "ds[value].last_ds",
      last_update: "last_update"
    })
  }, function (err, data) {
    if (err) {
      next(err);
    } else {
      var hash = {};

      _(data).each(function (value, type) {
        _(value).each(function (e, host) {
          hash[host] = hash[host] || {};
          hash[host][type] = e.value;
        });
      });

      res.json({
        heatmap: _(hash).map(function (value, key) {
          return {
            key: key,
            value: value.used / (value.used + value.free + value.cached + value.buffered),
            details: {
              used: value.used,
              free: value.free,
              cached: value.cached,
              buffered: value.buffered
            }
          };
        }).sortBy(function (e) {
          return e.key;
        }).value()
      });
    }
  });
};