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
        $scope.samples = codeSamples;
        $scope.showStop = false;
        $scope.state = {};
        $scope.maxStateIndex = 0;
        $scope.curStateIndex = 0;

        function setCurrentState() {
            $scope.state = $scope.states[$scope.curStateIndex];
        }

        $scope.$watch('curStateIndex', setCurrentState);

        function updateGrid() {
            $scope.grid = ($scope.editor.source||"").split('\n').map(function (line, y) {
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
            $scope.maxStateIndex = $scope.states.length- 1;
            $scope.curStateIndex = $scope.maxStateIndex;
            setCurrentState();
        }

        function run() {
            $scope.states = [];
            $scope.error = "";
            if(instance) $scope.stop();

            longRunTimer = $timeout(function () {
                $scope.showStop = true;
                longRunTimer = null;
            }, 1000);

            (instance = interpreter($scope.editor.source, true)).promise.then(function () {
                $scope.stop();
            }, function (error) {
                $scope.error = error;
                $scope.stop();
            }, function (state) {
                $scope.states.push(state);
                if($scope.states.length > 1000) {
                    $scope.error = "Exiting after 1000 iterations";
                    $scope.stop();
                }
            });
        }

        $scope.$watchCollection('editor', function (editor) {
            updateGrid();
            if(editor.autoUpdate) run();
        });
    });