angular.module('Befunge')
    .config(function ($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: "views/editor.html",
                controller: 'EditorCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
