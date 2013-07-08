'use strict';

var _ = require('lodash')
  , async = require('async')
  , rrdhelpers = require('./rrdhelpers.js');

/**
 * Load Card Interface
 */

module.exports = function (req, res, next) {
  async.waterfall([
    rrdhelpers.extractAll("load/load.rrd", {
      shortterm: "ds[shortterm].last_ds",
      midterm: "ds[midterm].last_ds",
      longterm: "ds[longterm].last_ds",
      last_update: "last_update"
    }),
    rrdhelpers.normalizeLoad(['shortterm', 'midterm', 'longterm'])
  ], function (err, data) {
    if (err) {
      next(err);
    } else {
      var output = {
        heatmap: _(data).map(function (e, i) {
          return { key: i, value: e.shortterm };
        }).sortBy(function (e) {
          return e.key;
        }).value(),
        average: {
          shortterm: _(data)
            .map(function (e) { return e.shortterm; })
            .reduce(function (a, b) { return a + b; }) / _.keys(data).length,

          midterm: _(data)
            .map(function (e) { return e.midterm; })
            .reduce(function (a, b) { return a + b; }) / _.keys(data).length,

          longterm: _(data)
            .map(function (e) { return e.longterm; })
            .reduce(function (a, b) { return a + b; }) / _.keys(data).length
        }
      };
      res.json(output);
    }
  });
};