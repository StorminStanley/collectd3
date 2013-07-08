/*jshint globalstrict:true, jquery:true, browser:true */
'use strict';

function DashboardCtrl($s, $root, $http, $location, helpers, $log) {

  $s.countByTemp = helpers.countByTemp;
  $s.b2s = helpers.bytesToSize;

  $s.switchCard = function (name) {
    $s.card = $root.card = name;
  };

  $s.card = $root.card || "load";

  $root.$watch('card', function () {
    $s.fetchView($s.card);
  });
  
  $s.statusOf = helpers.statusOf;
  
  $s.tooltip = {};
  
  $s.moveTo = function (host) {
    $location.path('/details/' + host).hash('');
    $s.$apply();
  };
  
  $s.showTooltip = function (host, value, label) {
    $s.tooltip.text = host;
    $s.tooltip.details = {};
    $s.tooltip.details[label] = value.toFixed(2);
    $s.$apply();
  };
  
  $s.showMemoryTooltip = function (host, details, label) {
    var total = details.used + details.free + details.cached + details.buffered;
    
    $s.tooltip.text = host;
    $s.tooltip.details = {};
    $s.tooltip.details[label] = helpers.bytesToSize(details.used).value + ' ' +
                       helpers.bytesToSize(details.used).multi + ' of ' +
                       helpers.bytesToSize(total).value + ' ' + helpers.bytesToSize(total).multi;
    $s.$apply();
  };

  $s.showNetworkTooltip = function (host, value, label) {
    $s.tooltip.text = host;
    $s.tooltip.details = {};
    $s.tooltip.details[label] = helpers.bytesToSize(value).value + ' ' +
                       helpers.bytesToSize(value).multi;
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

  $s.fetchView = function (view) {
    $log.resetTime();
    $log.time("Loading " + view.toUpperCase() + " data.");
    $http.get("/data/" + view)
      .success(function (res) {
        $s[view] = res;
        $log.time("Data for " + view.toUpperCase() + " has been loaded.");
      }).error(function () {
        $s[view] = {};
        $log.time("Data for " + view.toUpperCase() + " has been failed.");
      });
  };

  $s.fetch = function () {
    $log.time("Loading Aggregate data.");
    $http.get("/data/aggregate")
      .success(function (res) {
        $s.aggregate = res;
        $log.time("Aggregate data has been loaded.");
      }).error(function () {
        $s.aggregate = {};
        $log.time("Aggregate data has been failed.");
      });


  };

  $log.resetTime();
  $s.fetch();

}

DashboardCtrl.$inject = ['$scope', '$rootScope', '$http', '$location', 'helpers', '$log'];
