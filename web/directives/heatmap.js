'use strict';

angular.module('main')
  .directive('d3Heatmap', function () {
    return {
      restrict: 'E',
      scope: {
        val: '=',
        domain: '@',
        config: '=',
        d3Click: '&',
        d3Mouseover: '&',
        d3Mouseout: '&',
        d3Mousemove: '&'
      },
      link: function postLink(scope, element) {
        var vis = d3.select(element[0])
          , boxes
          , picker = vis.append("div")
            .attr("class", "picker")
          , heatmap = vis.append("div")
            .attr("class", "heatmap")
          , selected = [];

        scope.$watch('config', function (config) {
          if (!config) {
            return;
          }

          var pickList = config["heatmap"].map(function (e) {
            return config['node-types'][e];
          });

          picker.selectAll("span")
            .data(pickList)
            .enter().append("span")
            .attr("class", "picker-choice")
            .text(function (d) { return d.name; })
            .on("click", function (d) {
              var index = selected.indexOf(d.host),
                  isSelected = index !== -1;
              
              d3.select(this).classed("active", !isSelected);
              
              if (isSelected) {
                selected.splice(index, 1);
              } else {
                selected.push(d.host);
              }
              
              boxes.classed("dimmed", function (box) {
                var list = selected.map(function (host) {
                  return box.key.match(host);
                });
                return list.length ? !list.reduce(function (a, b) {
                  return a || b;
                }) : false;
              });
            });
        });
        
        scope.$watch('val', function (val) {
          var colorScale = d3.scale.quantize()
              .domain(scope.domain.split(',').map(function (e) {
                return parseFloat(e, 10);
              }))
              .range(d3.range(10).map(function (d) { return "cell" + d; }));

          if (!val) {
            return;
          }

          boxes = heatmap.selectAll("div")
              .data(val);

          boxes.enter().append("div")
            .attr("class", function (d) {
              var classes = ["box"];
              if (d !== null) {
                classes.push(colorScale(d.value));
              }
              return classes.join(" ");
            })
            .on("click", function (d) { scope.d3Click(d); })
            .on("mouseover", function (d) { scope.d3Mouseover(d); })
            .on("mouseout", function (d) { scope.d3Mouseout(d); })
            .on("mousemove", function () { scope.d3Mousemove({x: event.x, y: event.y}); });
        });
          
      }
    };
  });