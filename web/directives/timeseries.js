'use strict';

angular.module('main')
  .directive('d3Timeseries', function () {
    var w = 1024,
       h = 50,
       margin = { left: 150, right: 50, vertical: 20 };

    var periods = {
      day: {
        count: d3.time.hours,
        step: 4,
        format: '%H:%M'
      },
      week: {
        count: d3.time.days,
        step: 1,
        format: '%a %d'
      },
      month: {
        count: d3.time.days,
        step: 4,
        format: '%B %d'
      }
    };
    
    return {
      restrict: 'E',
      scope: {
        val: '=',
        scheme: '@',
        period: '=',
        d3Mouseover: '&',
        d3Mouseout: '&',
        d3Mousemove: '&'
      },
      link: function postLink(scope, element) {
        var vis = d3.select(element[0]).append("svg:svg")
           .attr("width", w);

        scope.$watch('val', function (val) {
          // clear the elements inside of the directive
          vis.selectAll('*').remove();

          // if 'val' is undefined, exit
          if (!val) {
            return;
          }
          
          var keys = scope.scheme.split(" ");

          vis.attr("height", h * (keys.length) + 30);

          var x = d3.scale.linear()
            .domain([val[keys[0]][0][0], val[keys[0]][val[keys[0]].length - 1][0]])
            .range([0 + margin.left, w - margin.right]);

          keys.forEach(function (key, i) {
            var data = val[key].filter(function (e) { return e[1] !== null; });

            var y = d3.scale.linear()
                .domain([d3.min(data, function (e) { return e[1]; }), d3.max(data, function (e) { return e[1]; })])
                .range([0, h - margin.vertical]);

            var lineGrp = vis.append("svg:g")
               .attr("transform", "translate(0, " + h * (i + 1) + ")");

            var line = d3.svg.line().interpolate("cardinal")
               .x(function (d) { return x(d[0]); })
               .y(function (d) { return -1 * y(d[1]); });

            lineGrp.append("svg:text")
              .text(key)
              .attr("x", 100)
              .attr("y", -h / 2 + margin.vertical)
              .attr("class", "graph-label")
              .attr("text-anchor", "end");

            lineGrp.append("svg:path")
              .attr("class", "graph " + key)
              .attr("d", line(data));

            lineGrp.selectAll("circle")
              .data(data.filter(function (e) { return e[2] > 0; }))
              .enter().append("svg:circle")
              .attr("class", "marker " + key + "-error")
              .attr('cx', function (d) { return x(d[0]); })
              .attr('cy', function (d) { return -1 * y(d[1]); })
              .attr('r', 3);
          });

          var meridianGrp = vis.append("svg:g");

          var medians = meridianGrp.selectAll("g")
            .data(val[keys[0]])
            .enter()
            .append('svg:g')
            .on("mouseover", function (d, i) {
              d3.select(this).classed("active", true);
              scope.d3Mouseover({ time: d[0], data: { load: val.load[i], memory: val.memory[i], storage: val.storage[i], network: val.network[i] } });
            })
            .on("mouseout", function () {
              d3.select(this).classed("active", false);
              scope.d3Mouseout();
            })
            .on("mousemove", function () {
              scope.d3Mousemove({x: event.x, y: event.y});
            });

          medians.append('svg:line')
            .attr("class", "meridian-bg")
            .attr("x1", function (d) { return x(d[0]); })
            .attr("x2", function (d) { return x(d[0]); })
            .attr("y1", margin.vertical)
            .attr("y2", scope.scheme.split(" ").length * h);

          medians.append('svg:line')
            .attr("class", "meridian")
            .attr("x1", function (d) { return x(d[0]); })
            .attr("x2", function (d) { return x(d[0]); })
            .attr("y1", margin.vertical)
            .attr("y2", scope.scheme.split(" ").length * h);

          var time = d3.time.scale()
            .domain([new Date(val[keys[0]][0][0] * 1000),
                     new Date(val[keys[0]][val[keys[0]].length - 1][0] * 1000)])
            .range([0 + margin.left, w - margin.right]);

          var period = periods[scope.period];

          var xAxis = d3.svg.axis()
            .scale(time)
            .orient('bottom')
            .ticks(period.count, period.step)
            .tickFormat(d3.time.format(period.format))
            .tickSize(0)
            .tickPadding(8);

          vis.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0, ' + (h * (keys.length) + 5) + ')')
            .call(xAxis);

        });
      }
    };
  });