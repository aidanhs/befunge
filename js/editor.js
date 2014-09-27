angular.module('Befunge')
    .value('codeSamples', {
        numbers: '>987v>.v\nv456<  :\n>321 ^ _@',
        hello: '>0"olleH":v\n      >:#,_56+3*,@',
        smile: '77*:9+,8-,@',
        empty: '@'
    })
    .controller('EditorCtrl', function ($scope, $interval, interpreter, codeSamples) {
        $scope.editor = { source: codeSamples.empty };
        $scope.samples = codeSamples;

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

        function copyState(state) {
            return {
                stack: angular.copy(state.stack),
                output: state.output,
                x: state.x,
                y: state.y,
                dir: state.dir
            };
        }

        $scope.play = function () {
            if($scope.player) return;
            $scope.player = $interval(function () {
                $scope.step();
            }, 50);
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
            if(!$scope.interp) {
                $scope.stop();
                return;
            }

            var interp = $scope.interp;
            if(interp.step()) {
                $scope.states.push(copyState(interp.state));
            } else {
                $scope.error = interp.state.error;
                interp = null;
                $scope.stop();
            }
            updateScrubber();
        };

        function run() {
            $scope.stop();
            var interp = $scope.interp = interpreter($scope.editor.source);
            $scope.states = [copyState(interp.state)];
            $scope.error = interp.state.error;
            updateScrubber();
        }

        $scope.$watchCollection('editor.source', function (editor) {
            run();
        });
    });