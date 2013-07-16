'use strict';

angular.module('main')
  .directive('d3BarChart', function () {
    return {
      restrict: 'E',
      scope: {
        val: '=',
        domain: '@'
      },
      link: function postLink(scope, element) {
        var vis = d3.select(element[0])
          , bars;

        scope.$watch('val', function (val) {
          if (!val) {
            return;
          }

          vis.selectAll("div").remove();
          
          bars = vis.selectAll("div")
              .data(val);

          var bar = bars.enter().append("div")
            .attr("class", "bar");

          bar.append("div")
            .attr("class", "used");

          bar.append("div")
            .attr("class", "wait");

          bars.selectAll(".used")
            .style("height", function (d) {
              return d.used * 100 + "%";
            });

          bars.selectAll(".wait")
            .style("height", function (d) {
              return d.wait * 100 + "%";
            });
        });
          
      }
    };
  });