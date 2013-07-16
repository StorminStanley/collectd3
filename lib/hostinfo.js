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
var hostInfoLoad = function (host, time) {
  return rrdhelpers.fetchLast(host, "load/load.rrd", "MAX", rrdhelpers.timer(time));
};

/**
 * Extract Memory data of specific host.
 * @param host - name of the host to fetch
 * @return Set of used, free, cached and buffered objects.
 *      Each of them consist of value and last_update.
 */
var hostInfoMemory = function (host, time) {
  return _.partial(async.parallel, {
    used: rrdhelpers.fetchLast(host, "memory/memory-used.rrd", "AVERAGE", rrdhelpers.timer(time)),
    free: rrdhelpers.fetchLast(host, "memory/memory-free.rrd", "AVERAGE", rrdhelpers.timer(time)),
    cached: rrdhelpers.fetchLast(host, "memory/memory-cached.rrd", "AVERAGE", rrdhelpers.timer(time)),
    buffered: rrdhelpers.fetchLast(host, "memory/memory-buffered.rrd", "AVERAGE", rrdhelpers.timer(time))
  });
};

/**
 * Extract Storage data of specific host.
 * @param host - name of the host to fetch
 * @return Set of used, free and last_update
 */
var hostInfoStorage = function (host, time) {
  var type = _(config.client['node-types']).filter(function (e) {
    return host.match(e.host) && e.partition;
  }).value()[0] || { partition: [] };
  
  if (_.isString(type.partition)) {
    type.partition = [type.partition];
  }
  
  return function (cb) {
    async.parallel(_.map(type.partition, function (e) {
      return function (cb) {
        rrdhelpers.fetchLast(host, "df/df-" + e + ".rrd", "AVERAGE", rrdhelpers.timer(time))
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
var hostInfoVcpu = function (host, time) {
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
            idle: rrdhelpers.fetchLast(host, e + '/cpu-idle.rrd', "AVERAGE", rrdhelpers.timer(time)),
            inte: rrdhelpers.fetchLast(host, e + '/cpu-interrupt.rrd', "AVERAGE", rrdhelpers.timer(time)),
            nice: rrdhelpers.fetchLast(host, e + '/cpu-nice.rrd', "AVERAGE", rrdhelpers.timer(time)),
            sftirq: rrdhelpers.fetchLast(host, e + '/cpu-softirq.rrd', "AVERAGE", rrdhelpers.timer(time)),
            steal: rrdhelpers.fetchLast(host, e + '/cpu-steal.rrd', "AVERAGE", rrdhelpers.timer(time)),
            system: rrdhelpers.fetchLast(host, e + '/cpu-system.rrd', "AVERAGE", rrdhelpers.timer(time)),
            user: rrdhelpers.fetchLast(host, e + '/cpu-user.rrd', "AVERAGE", rrdhelpers.timer(time)),
            wait: rrdhelpers.fetchLast(host, e + '/cpu-wait.rrd', "AVERAGE", rrdhelpers.timer(time))
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
var hostInfoStorageIO = function (host) {
  var now = config.server['last-timestamp'] || Math.round(new Date().getTime() / 1000);
  var period = {
    from: now - 86400,
    to: now,
    resolution: 86400
  };
  
  var list = _.filter(config.client['node-types'], function (e) {
    return host.match(e.host) && e.disks;
  })[0];
  
  return function (cb) {
    if (list) {
      async.parallel({
        average: _.partial(async.parallel, _.map(list.disks, function (e) {
          return rrdhelpers.fetch(host, 'disk-' + e + '/disk_octets.rrd', "AVERAGE", period);
        })),
        max: _.partial(async.parallel, _.map(list.disks, function (e) {
          return rrdhelpers.fetch(host, 'disk-' + e + '/disk_octets.rrd', "MAX", period);
        }))
      }, function (err, data) {
        if (err) {
          cb(err);
        } else {
          var result = {};
        
          result.average = _(data.average).map(function (disk) {
            return _(disk).map(function (e) {
              return e.read + e.write;
            }).reduce(function (a, b) {
              return a + b;
            });
          }).reduce(function (a, b) {
            return a + b;
          });
        
          result.peak = _(data.max).map(function (disk) {
            return _(disk).map(function (e) {
              return e.read + e.write;
            }).max().value();
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
var hostInfoNetworkIO = function (host) {
  var now = config.server['last-timestamp'] || Math.round(new Date().getTime() / 1000);
  var period = {
    from: now - 86400,
    to: now,
    resolution: 86400
  };
  
  return function (cb) {
    async.parallel({
      average: rrdhelpers.fetch(host, "interface/if_octets-vlan11.rrd", "AVERAGE", period),
      max: rrdhelpers.fetch(host, "interface/if_octets-vlan11.rrd", "MAX", period),
      errors: rrdhelpers.fetch(host, "interface/if_errors-vlan11.rrd", "MAX", period)
    }, function (err, data) {
      if (err) {
        cb(err);
      } else {
        var result = {};
        
        result.average = _(data.average).map(function (e) {
          return e.rx + e.tx;
        }).reduce(function (a, b) {
          return a + b;
        }) || 0;
        
        result.peak = _(data.max).map(function (e) {
          return e.rx + e.tx;
        }).max().value();
        
        result.peak = result.peak !== -Infinity ? result.peak : 0;
        
        result.errors = _(data.errors).map(function (e) {
          return e.rx + e.tx;
        }).max().value();
        
        result.errors = result.errors !== -Infinity ? result.errors : 0;
        
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
      time = req.query.time;

  async.parallel({
    load: hostInfoLoad(host, time),
    memory: hostInfoMemory(host, time),
    storage: hostInfoStorage(host, time),
    vcpu: hostInfoVcpu(host, time),
    storageio: hostInfoStorageIO(host, time),
    networkio: hostInfoNetworkIO(host, time)
  }, function (err, data) {
    if (err) {
      next(err);
    } else {
      res.json(data);
    }
  });
};