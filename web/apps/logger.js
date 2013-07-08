'use strict';
angular.module('main')
  .config(function ($provide) {
    $provide.decorator('$log', ['$delegate', function ($delegate) {
      var time = new Date(),
          lastTime,
          records = [];

      $delegate.resetTime = function () {
        time = new Date();
        lastTime = 0;
        $delegate.info("Time has been reseted");
        records.push({ time: 0, message: "Time reset", reset: true });
      };

      $delegate.time = function (message) {
        var now = new Date() - time;

        lastTime = now;

        records.push({ time: now, message: message });
        $delegate.info("t+" + now / 1000 + ' ->', message);
      };

      $delegate.getLastTime = function () {
        return lastTime;
      };

      $delegate.getRecords = function () {
        return records;
      };
      
      $delegate.clearRecords = function () {
        records = [];
      };

      return $delegate;
    }]);
  }).directive('ssLogger', ['$log', function ($log) {
    return {
      restrict: 'E',
      templateUrl: 'apps/logger.html',
      replace: true,
      link: function postLink(scope) {
        scope.$log = $log;
        scope.show = false;
      }
    };
  }]);