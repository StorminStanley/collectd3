'use strict';

angular.module('main')
  .directive('d3Tooltip', function () {
    return {
      restrict: 'E',
      templateUrl: 'apps/tooltip.html',
      scope: {
        message: '='
      },
      replace: true
    };
  });