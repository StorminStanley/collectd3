'use strict';

function DetailsCtrl($s, $http, $routeParams, helpers, $filter, $log) {

  $s.$routeParams = $routeParams;
  $s.bytesToSize = helpers.bytesToSize;

  $s.countByTemp = helpers.countByTemp;

  $s.x = 0;
  $s.useMock = false;
  $s.period = 'day';

  $s.tooltip = {};

  $s.showTooltip = function (time, data) {
    $s.tooltip.text = $filter('date')(time * 1000, 'EEE, MMM d HH:mm');
    $s.tooltip.details = {
      'Load': data.load && data.load[1] !== null ? data.load[1].toFixed(2) : "?",
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

  $s.fetch = function () {
    // TODO: get the parameters from hour/3 hours/day/week/year selector
    var params = { period: $s.period };
    $log.time("Loading details data");

    var urlInfo = $s.useMock ? "/host-info.json"
           : "/data/" + $routeParams.host + "/info";
    $http.get(urlInfo)
      .success(function (res) {
        $s.info = res;
        $log.time("Info data loaded");
      })
      .error(function () {
        $s.info = {};
        $log.time("Info data failed");
      });

    var urlGraph = $s.useMock ? "/graph.json"
          : "/data/" + $routeParams.host + "/graph";
    $http.get(urlGraph, {params : params})
      .success(function (res) {
        $s.graph = res;
        $log.time("Graph data loaded");
      }).error(function () {
        $s.graph = {};
        $log.time("Graph data failed");
      });
      
  };

  $s.$watch('period', function () {
    $log.resetTime();
    $s.fetch();
  });


}

DetailsCtrl.$inject = ['$scope', '$http', '$routeParams', 'helpers', '$filter', '$log'];