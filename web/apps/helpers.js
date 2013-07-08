/*global angular*/
'use strict';

angular.module('main')
  .value('helpers', {
    bytesToSize: function (bytes) {
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
          i = 0;
      if (bytes >= 1) {
        i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
      }
      var value = bytes / Math.pow(1024, i);
      return { value: value.toFixed(3 - value.toString().split('.')[0].length), multi: sizes[i] };
    },
    statusOf: function (type, value) {
      if (type === 'load') {
        if (value > 1) { return { status: 'warning', text: 'busy' }; }
        if (value > 0.7) { return { status: 'attention', text: 'warming' }; }
        return { status: 'normal' };
      } else if (type === 'network-errors') {
        return value ? { status: 'warning', text: 'errors' } : { status: 'normal' };
      } else {
        if (value > 95) { return { status: 'warning', text: 'run out' }; }
        if (value > 80) { return { status: 'attention', text: 'running out' }; }
        return { status: 'normal' };
      }
    }
  });