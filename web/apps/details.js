'use strict';

function DetailsCtrl($s, $http, $routeParams, helpers, $filter, $log) {

  $s.$routeParams = $routeParams;
  $s.bytesToSize = helpers.bytesToSize;
  $s.statusOf = helpers.statusOf;
  $s.countByTemp = helpers.countByTemp;

  $s.period = 'day';
  $s.time = null;

  $s.tooltip = {};

  $s.showTooltip = function (time, data) {
    $s.tooltip.text = $filter('date')(time * 1000, 'EEE, MMM d HH:mm');
    $s.tooltip.details = {
      'Load': data.load && data.load[1] !== null ?
              data.load[1].toFixed(2) + ' (' + data.load[3].toFixed(2) + ')' : "?",
      'Memory %': data.memory && data.memory[1] !== null ? data.memory[1].toFixed(2) : "?",
      'Memory used': data.memory && data.memory[3] !== null ?
        helpers.bytesToSize(data.memory[3]).value + ' ' +
        helpers.bytesToSize(data.memory[3]).multi : "?",
      'Memory free': data.memory && data.memory[4] !== null ?
        helpers.bytesToSize(data.memory[4]).value + ' ' +
        helpers.bytesToSize(data.memory[4]).multi : "?",
      'Storage IO': data.storage && data.storage[1] !== null ?
        helpers.bytesToSize(data.storage[1]).value + ' ' +
        helpers.bytesToSize(data.storage[1]).multi : "?",
      'Network IO': data.network && data.network[1] !== null ?
        helpers.bytesToSize(data.network[1]).value + ' ' +
        helpers.bytesToSize(data.network[1]).multi : "?"
    };
    $s.$apply();
  };

  $s.hideTooltip = function () {
    $s.tooltip = {};
    $s.$apply();
  };

  $s.moveTooltip = function (x, y) {
    $s.tooltip.x = x;
    $s.tooltip.y = y;
    $s.$apply();
  };

  window.stTm = $s.setTime = function (time) {
    $s.time = time;
    $s.$apply();
  };

  $s.$watch('time', function () {
    $log.resetTime();

    $log.time("Loading details info");

    $http.get("/data/" + $routeParams.host + "/info", { params: { time: $s.time } })
      .success(function (res) {
        $s.info = res;
        $log.time("Info data loaded");
      })
      .error(function () {
        $s.info = {};
        $log.time("Info data failed");
      });

  });

  $s.$watch('period', function () {
    $log.resetTime();

    $log.time("Loading details graph");

    $http.get("/data/" + $routeParams.host + "/graph", { params : { period: $s.period } })
      .success(function (res) {
        $s.graph = res;
        $log.time("Graph data loaded");
      }).error(function () {
        $s.graph = {};
        $log.time("Graph data failed");
      });
  });

}

DetailsCtrl.$inject = ['$scope', '$http', '$routeParams', 'helpers', '$filter', '$log'];