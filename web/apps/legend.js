'use strict';

angular.module('main')
  .directive('d3Legend', function () {
    return {
      restrict: 'E',
      templateUrl: 'apps/legend.html',
      scope: {
        limits: '@',
        val: '='
      },
      replace: true,
      link: function postLink(scope) {
        scope.$watch('val', function (val) {
          var domain = scope.limits.split(',').map(function (e) {
            return parseFloat(e, 10);
          });
          scope.countTemp = function (temp) {
            var levels = {
              hot: function (e) {
                return e.value > domain[1];
              },
              warm: function (e) {
                return e.value > domain[0] && e.value <= domain[1];
              },
              cold: function (e) {
                return e.value <= domain[0];
              }
            };
            return (val || []).filter(levels[temp]).length;
          };
        });
      }
    };
  });