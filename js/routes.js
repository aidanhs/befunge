angular.module('Befunge')
    .config(function ($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: "views/menu.html",
                controller: 'MenuCtrl'
            })
            .when('/editor', {
                templateUrl: "views/editor.html",
                controller: 'EditorCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });