'use strict';

var _ = require('lodash')
  , async = require('async')
  , config = require('mech-config').server
  , fs = require('fs')
  , rrd = require("rrd");

var forAll = function (path, func, match) {
  return function (callback) {
    var local = {
      readHostsDirectory: _.partial(fs.readdir, config['data-directory']),

      filterDirectories: function (hosts, cb) {
        async.filter(hosts, function (host, callback) {
          fs.stat([config['data-directory'], host].join("/"), function (err, stat) {
            callback(!stat.isFile() && (match ? host.match(match) : true));
          });
        }, function (data) {
          cb(null, data);
        });
      },

      filterFileExist: function (hosts, cb) {
        async.filter(hosts, function (host, callback) {
          fs.exists([config['data-directory'], host, path].join("/"), callback);
        }, function (data) {
          cb(null, data);
        });
      }
    };

    async.waterfall([
      _.partial(async.waterfall, [
        local.readHostsDirectory,
        local.filterDirectories,
        local.filterFileExist
      ]),
      function (hosts, cb) {
        async.parallel(_.zipObject(hosts, _.map(hosts, func)), cb);
      }
    ], callback);
  };
};

/**
 * fetchRRD: Calls rrdtool and returns the data.
 * @param host - name of the host to fetch
 * @param rrd_file - relative path to rrd file config['data-directory']/{host_id}
 * @param cf - RRD Config Function (AVERAGE, MIN, MAX, LAST)
 * @param query - set of request parameters (from, to, r)
 *
 * Note: it uses execFile, thus will throw if rdtool output result > 200Mb
 * If the buffer is bigger, one can switch to spawn,
 * but think again: why returning big data to the client?
 */
var fetch = function (host, file, cf, query) {
  return function (callback) {
    var path = [config['data-directory'], host, file].join('/')
      , options = {
      cf: cf,
      start: query.from,
      end: query.to,
      resolution: query.resolution
    };

    rrd.fetch(path, options, function (err, data) {
      if (err) {
        console.warn('Warning:', err);
        callback(null);
      } else {
        if (_.some(data[data.length - 1], function (e) {
          return _.isNaN(e);
        })) {
          data.pop();
        }
        callback(null, data);
      }
    });
  };
};

var fetchAll = function (file, cf, query, match) {
  return forAll(file, function (host) {
    return fetch(host, file, cf, query);
  }, match);
};

/**
 * Async-compatible wrapper around infoRRD to extract only specific set of keys.
 * @param host - name of host to extract
 * @param file - relative path to the .rrd file in collectd structure
 * @param keys - set of keys to extract
 */
var extract = function (host, file, keys) {
  return function (cb) {
    var rrd_file_path = [config['data-directory'], host, file].join('/');
    rrd.info(rrd_file_path, function (info) {
      var data = {};

      _(keys).each(function (e, key) {
        if (info.hasOwnProperty(e)) {
          data[key] = parseFloat(info[e]);
        }
      });
      cb(null, data);
    });
  };
};

/**
* Iterates all 'host' folders under collectd data root, and calls info on the specified
* rrd file, and returns an array of results [{host:hostname,info:data}...]
* @param path - path to the .rrd file in collectd structure, relative to "host" directory
* @param info - list of rrd info keys which we need values for
* @param callback(err, data) - calls with (err, null) on error, and (null, data)
* where data is an array of info outputs.
*/
var extractAll = function (path, keys) {
  return forAll(path, function (host) {
    return extract(host, path, keys);
  });
};

/**
* Normalizes Load Average based on a number of cores.
* @param cols - array of indices of columns to normalize
* @param data - array of data to normalize
* @param callback - calls with (err, null) on error, and (null, data)
* where data is an array of info outputs.
*/
var normalizeLoad = function (cols, host) {
  return function (data, callback) {
    cols = cols || [1];
    
    if (host) {
      var o = {};
      o[host] = data;
      data = o;
    }

    async.each(_.keys(data), function (host, cb) {
      var dir = [config['data-directory'], host].join('/');
      var str = "cpu-";
      
      fs.readdir(dir, function (err, filenames) {
        if (err) {
          cb(err);
        } else {
          var numberOfCpus = _.filter(filenames, function (e) {
            return e.slice(0, str.length) === str;
          }).length;
          _(cols).each(function (i) { data[host][i] = data[host][i] / numberOfCpus; });
          cb();
        }
      });
    }, function (err) {
      callback(err, host ? data[host] : data);
    });
  };
};

module.exports = { fetch: fetch
                 , fetchAll: fetchAll
                 , extract: extract
                 , extractAll: extractAll
                 , normalizeLoad: normalizeLoad
                 };