'use strict';

/* App Module */
angular.module('main', [])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/dashboard',
        {templateUrl: 'apps/dashboard.html', controller: 'DashboardCtrl'})
      .when('/details/:host',
        {templateUrl: 'apps/details.html', controller: 'DetailsCtrl'})
      .otherwise({redirectTo: '/dashboard'});
  }]);

angular.module('main')
  .controller('MainCtrl', ['$scope', '$rootScope', '$location', '$http', '$log',
    function ($s, $root, $loc, $http, $log) {
    // Notice an alternative way to trigger injection. But it generates jslint warning.

    // Spec: Show the hostname in nav bar.
    // Keep the selected host in navbar (greyed out) when route is back to dashboard.
    $s.root = $root;
    
    $root.context = {
      status : "",
      host: ""
    };

    $s.$on("$routeChangeStart", function (event, next) {
      if (next.params.host) {
        $root.context.host = next.params.host;
      }
    });

    $s.isActiveLocation = function (route) {
      return route === $loc.path();
    };

    $log.time("Loading Config data.");
    $http.get("/config")
      .success(function (res) {
        $s.config = res;
        $log.time("Config data has been loaded.");
      }).error(function () {
        $s.config = {};
        $log.time("Config data has been failed.");
      });

  }]);