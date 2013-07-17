/*global angular*/
'use strict';

angular.module('main')
  .factory('helpers', ['$rootScope', function ($root) {
    return {
      bytesToSize: function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
            i = 0;
        if (bytes >= 1) {
          i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        }
        var value = bytes / Math.pow(1024, i);
        var precision = 3 - value.toString().split('.')[0].length;
        return { value: value.toFixed(precision < 0 ? 0 : precision), multi: sizes[i] };
      },
      statusOf: function (type, value) {
        var rules = $root.config.levels
          , rule = rules[type] ? rules[type] : rules['default'];

        for (var i = 0; i < rule.length; i++) {
          if (rule[i].level <= value) {
            return rule[i];
          }
        }
      }
    };
  }]);