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
          var colorScale = d3.scale.quantize()
              .domain(scope.domain.split(',').map(function (e) {
                return parseFloat(e, 10);
              }))
              .range(d3.range(10).map(function (d) { return "cell" + d; }));

          if (!val) {
            return;
          }

          bars = vis.selectAll("div")
              .data(val);

          bars.enter().append("div")
            .attr("class", "bar")
            .append("div")
            .attr("class", function (d) {
              var classes = ["used"];
              if (d !== null) {
                classes.push(colorScale(d.value));
              }
              return classes.join(" ");
            })
            .style("height", function (d) {
              return (d.value * 100).toFixed(0) + "px";
            });
            //.style("width", "10px");
        });
          
      }
    };
  });