angular.module('Befunge')
    .controller('MenuCtrl', function ($scope, $location) {
        $scope.edit = function () {
            $location.path("/editor");
        }
    });