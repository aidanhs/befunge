angular.module('Befunge')
    .value('codeSamples', {
        numbers: '>987v>.v\nv456<  :\n>321 ^ _@',
        hello: '>0"olleH":v\n      >:#,_56+3*,@',
        smile: '77*:9+,8-,@',
        empty: '@'
    })
    .controller('EditorCtrl', function ($scope, codeSamples, $timeout, interpreter) {
        $scope.editor = { source: codeSamples.empty, autoUpdate: true };
        $scope.grid = [];
        $scope.states = [];
        $scope.state = {};
        $scope.samples = codeSamples;
        $scope.showStop = false;

        function handleResponse(data) {
            $scope.states.push(data);
            $scope.state = data;
            if (data.done) {
                $scope.stop();
            }
        }

        function updateGrid() {
            $scope.grid = ($scope.editor.source||[]).split('\n').map(function (line, y) {
                return line.split("").map(function (cell, x) {
                    var hash = 13;
                    hash = (hash * 7) + x;
                    hash = (hash * 7) + y;
                    hash = (hash * 7) + cell.charCodeAt(0);
                    return {id:hash,type:cell};
                });
            });
        }

        var instance = null;
        var longRunTimer = null;

        $scope.stop = function() {
            instance.cancel();
            if(longRunTimer) {
                $timeout.cancel(longRunTimer);
                longRunTimer = null;
            }
            $scope.showStop = false;
        }

        function run() {
            $scope.states = [];
            if(instance) $scope.stop();
            longRunTimer = $timeout(function () {
                $scope.showStop = true;
                longRunTimer = null;
            }, 1000);
            (instance = interpreter($scope.editor.source, true)).promise.then(handleResponse, handleResponse, handleResponse);
        }

        $scope.$watchCollection('editor', function (editor) {
            updateGrid();
            if(editor.autoUpdate) run();
        });
    });