angular.module('Befunge')
    .value('codeSamples', {
        numbers: '>987v>.v\nv456<  :\n>321 ^ _@',
        hello: '>0"olleH":v\n      >:#,_56+3*,@',
        smile: '77*:9+,8-,@',
        smile2: '77*:9+01p8-11p@',
        empty: '@',
        exitLooper: '61v\n>\\>2*:0v\n|:-1\\p3<'
    })
    .controller('EditorCtrl', function ($scope, $interval, interpreter, codeSamples, cheatSheet) {
        $scope.editor = { source: codeSamples.empty };
        $scope.samples = codeSamples;
        $scope.cheatSheet = cheatSheet;

        $scope.states = [];
        $scope.state = {};
        $scope.maxStateIndex = 0;
        $scope.curStateIndex = 0;
        $scope.player = null;

        $scope.$watch('curStateIndex', function (idx) {
            $scope.state = $scope.states[idx];
        });

        function updateScrubber() {
            $scope.maxStateIndex = $scope.states.length - 1;
            $scope.curStateIndex = $scope.maxStateIndex;
            $scope.state = $scope.states[$scope.curStateIndex];
        }

        $scope.play = function () {
            if($scope.player) return;
            $scope.player = $interval(function () {
                $scope.step();
            }, 50);
            $scope.step();
        };
        $scope.stop = function () {
            if($scope.player) {
                $interval.cancel($scope.player);
                $scope.player = null;
            }
        };

        $scope.$on('$destroy', function () {
            $scope.stop();
        });

        $scope.step = function () {
            if($scope.curStateIndex < $scope.maxStateIndex) {
                $scope.curStateIndex++;
                return;
            }

            if(!$scope.interp) {
                $scope.stop();
                return;
            }

            var interp = $scope.interp;
            if(interp.step()) {
                $scope.states.push(angular.copy(interp.state));
            } else {
                var state = $scope.states[$scope.states.length-1];
                state.error = interp.state.error;
                state.done = 1;
                interp = null;
                $scope.stop();
            }
            updateScrubber();
        };

        function run() {
            $scope.stop();
            var interp = $scope.interp = interpreter($scope.editor.source);
            $scope.states = [angular.copy(interp.state)];
            $scope.error = interp.state.error;
            updateScrubber();
        }

        $scope.$watchCollection('editor.source', run);
    });