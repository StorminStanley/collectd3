'use strict';

angular.module('main')
  .directive('d3Speedometer', ['helpers', function (helpers) {
    var w = 152, h = 152,
        r = Math.min(w, h) / 2,
        arc = d3.svg.arc().innerRadius(r).outerRadius(r - 12),
        markers = [ { domain: 0, range: -135 }
                  , { domain: 0.7, range: -45 }
                  , { domain: 1, range: 45 }
                  , { domain: 5, range: 135 }
                  ];

    var degToRad = function (value) {
      return value * Math.PI / 180;
    };

    var scale = d3.scale.linear()
        .domain(markers.map(function (m) { return m.domain; }))
        .range(markers.map(function (m) { return degToRad(m.range); }));

    return {
      restrict: 'E',
      scope: {
        val: '=',
        title: '@'
      },
      link: function postLink(scope, element) {
        var svg = d3.select(element[0]).append("svg:svg")
          .attr("width", w).attr("height", h);

        scope.$watch('val', function (val) {
          // clear the elements inside of the directive
          svg.selectAll('*').remove();

          // if 'val' is undefined, exit
          if (!val) {
            return;
          }
          // ARC Group
          var arcGroup = svg.append("svg:g")
            .attr("class", "arcGroup")
            .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

          arcGroup.append("svg:path")
            .attr("class", "load-0 svg-" + helpers.statusOf('load', val).status)
            .attr("d", arc.startAngle(scale(markers[0].domain)).endAngle(scale(val)));

          arcGroup.append("svg:path")
            .attr("class", "svg-void")
            .attr("d", arc.startAngle(scale(val))
                          .endAngle(scale(markers[markers.length - 1].domain)));

          // CTR GROUP
          var ctrGroup = svg.append("svg:g")
            .attr("class", "ctrGroup")
            .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

          ctrGroup.append("svg:text")
            .attr("dy", ".15em")
            .attr("text-anchor", "middle")
            .attr("class", "chart-kpi svg-" + helpers.statusOf('load', val).status)
            .text(val);

          ctrGroup.append("svg:text")
            .attr("dy", "3em")
            .attr("text-anchor", "middle")
            .attr("class", "chart-label")
            .text(scope.title);

        });
      }
    };
  }]);