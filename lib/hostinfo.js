'use strict';

var _ = require('lodash')
  , async = require('async')
  , config = require('mech-config')
  , fs = require('fs')
  , rrdhelpers = require('./rrdhelpers.js');

/**
 * Extract Load data of specific host.
 * @param host - name of the host to fetch
 * @return Set of shortterm, midterm, longterm and last_update
 */
var hostInfoLoad = function (host, time, period) {
  return rrdhelpers.fetchLast(host, "load/load.rrd", "MAX", rrdhelpers.timer(time, period));
};

/**
 * Extract Memory data of specific host.
 * @param host - name of the host to fetch
 * @return Set of used, free, cached and buffered objects.
 *      Each of them consist of value and last_update.
 */
var hostInfoMemory = function (host, time, period) {
  return _.partial(async.parallel, {
    used: rrdhelpers.fetchLast(host, "memory/memory-used.rrd", "AVERAGE", rrdhelpers.timer(time, period)),
    free: rrdhelpers.fetchLast(host, "memory/memory-free.rrd", "AVERAGE", rrdhelpers.timer(time, period)),
    cached: rrdhelpers.fetchLast(host, "memory/memory-cached.rrd", "AVERAGE", rrdhelpers.timer(time, period)),
    buffered: rrdhelpers.fetchLast(host, "memory/memory-buffered.rrd", "AVERAGE", rrdhelpers.timer(time, period))
  });
};

/**
 * Extract Storage data of specific host.
 * @param host - name of the host to fetch
 * @return Set of used, free and last_update
 */
var hostInfoStorage = function (host, time, period) {
  var type = _(config.client['node-types']).filter(function (e) {
    return host.match(e.host) && e.partition;
  }).value()[0] || { partition: [] };
  
  if (_.isString(type.partition)) {
    type.partition = [type.partition];
  }
  
  return function (cb) {
    async.parallel(_.map(type.partition, function (e) {
      return function (cb) {
        rrdhelpers.fetchLast(host, "df/df-" + e + ".rrd", "AVERAGE", rrdhelpers.timer(time, period))
        (function (err, data) {
          if (err) {
            cb(err);
          } else {
            data.name = e;
            cb(err, data);
          }
        });
      };
    }), cb);
  };
};

/**
 * Extract VCPU data of specific host.
 * @param host - name of the host to fetch
 * @return Array of %used for each VCPU
 */
var hostInfoVcpu = function (host, time, period) {
  return function (cb) {
    var dir = config.server['data-directory'] + '/' + host;
    var str = "cpu-";

    fs.readdir(dir, function (err, filenames) {
      if (err) {
        cb(err);
      } else {
        var listCpus = filenames.filter(function (e) {
          return e.slice(0, str.length) === str;
        });

        async.parallel(_.map(listCpus, function (e) {
          return _.partial(async.parallel, {
            _id: function (cb) { cb(null, parseInt(e.slice(str.length), 10)); },
            idle: rrdhelpers.fetchLast(host, e + '/cpu-idle.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            inte: rrdhelpers.fetchLast(host, e + '/cpu-interrupt.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            nice: rrdhelpers.fetchLast(host, e + '/cpu-nice.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            sftirq: rrdhelpers.fetchLast(host, e + '/cpu-softirq.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            steal: rrdhelpers.fetchLast(host, e + '/cpu-steal.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            system: rrdhelpers.fetchLast(host, e + '/cpu-system.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            user: rrdhelpers.fetchLast(host, e + '/cpu-user.rrd', "AVERAGE", rrdhelpers.timer(time, period)),
            wait: rrdhelpers.fetchLast(host, e + '/cpu-wait.rrd', "AVERAGE", rrdhelpers.timer(time, period))
          });
        }), function (err, data) {
          cb(err, _(data).sortBy(function (e) {
            return e._id;
          }).map(function (e) {
            var name = e._id;
            delete e._id;
            
            var total = _(e)
              .map(function (e) { return e.value; })
              .reduce(function (a, b) { return a + b; });

            return { _id: name, used: 1 - (e.idle.value / total), wait: e.wait.value / total };
          }).value());
        });
      }
    });
  };
};

/**
 * Extract Storage IO data of specific host.
 * @param host - name of the host to fetch
 * @return Total troughput of all disks
 */
var hostInfoStorageIO = function (host, time, period) {
  var list = _.filter(config.client['node-types'], function (e) {
    return host.match(e.host) && e.disks;
  })[0];
  
  return function (cb) {
    if (list) {
      async.parallel({
        average: _.partial(async.parallel, _.map(list.disks, function (e) {
          return rrdhelpers.fetchLast(host, 'disk-' + e + '/disk_octets.rrd', "AVERAGE", rrdhelpers.timer(time, period));
        })),
        max: _.partial(async.parallel, _.map(list.disks, function (e) {
          return rrdhelpers.fetchLast(host, 'disk-' + e + '/disk_octets.rrd', "MAX", rrdhelpers.timer(time, period));
        }))
      }, function (err, data) {
        if (err) {
          cb(err);
        } else {
          var result = {};

          result.average = _(data.average).map(function (disk) {
            return disk.read + disk.write;
          }).reduce(function (a, b) {
            return a + b;
          });

          result.peak = _(data.max).map(function (disk) {
            return disk.read + disk.write;
          }).max().value();

          cb(null, result);
        }
      });
    } else {
      cb(null, { average: 0, peak: 0 });
    }
  };
};

/**
 * Extract Network IO data of specific host.
 * @param host - name of the host to fetch
 * @return Total troughput of network interface
 */
var hostInfoNetworkIO = function (host, time, period) {
  return function (cb) {
    async.parallel({
      average: rrdhelpers.fetchLast(host, "interface/if_octets-vlan11.rrd", "AVERAGE", rrdhelpers.timer(time, period)),
      max: rrdhelpers.fetchLast(host, "interface/if_octets-vlan11.rrd", "MAX", rrdhelpers.timer(time, period)),
      errors: rrdhelpers.fetchLast(host, "interface/if_errors-vlan11.rrd", "MAX", rrdhelpers.timer(time, period))
    }, function (err, data) {
      if (err) {
        cb(err);
      } else {
        var result = {};
        result.average = data.average ? data.average.rx + data.average.tx : 0;
        result.peak = data.max ? data.max.rx + data.max.tx : 0;
        result.errors = data.errors ? data.errors.rx + data.errors.tx : 0;
        cb(null, result);
      }
    });
  };
};

/**
 * Single Host Info Interface
 */

module.exports = function (req, res, next) {

  var host = req.params.id,
      period = req.query.period,
      time = req.query.time;

  async.parallel({
    load: hostInfoLoad(host, time, period),
    memory: hostInfoMemory(host, time, period),
    storage: hostInfoStorage(host, time, period),
    vcpu: hostInfoVcpu(host, time, period),
    storageio: hostInfoStorageIO(host, time, period),
    networkio: hostInfoNetworkIO(host, time, period)
  }, function (err, data) {
    if (err) {
      next(err);
    } else {
      res.json(data);
    }
  });
};