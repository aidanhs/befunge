angular.module('Befunge')
    .value('codeSamples', {
        numbers: '>987v>.v\nv456<  :\n>321 ^ _@',
        hello: '>0"olleH":v\n      >:#,_56+3*,@',
        smile: '77*:9+,8-,@',
        smile2: '77*:9+01p8-11p@',
        empty: '@',
        exitLooper: '61v\n>\\>2*:0v\n|:-1\\p3<'
    })
    .controller('EditorCtrl', function ($scope, $interval, interpreter, codeSamples) {
        $scope.editor = { source: codeSamples.empty };
        $scope.samples = codeSamples;
        var states, interp;

        function step() {
            if(interp) {
                var hasMore = interp.step();
                states.push(angular.copy(interp.state));
                $scope.$broadcast(hasMore ? 'state.changed' : 'state.done', states);
                if(!hasMore) interp = null;
            }
        }

        function start() {
            interp = interpreter($scope.editor.source);
            states = [angular.copy(interp.state)];
            $scope.error = interp.state.error;
            $scope.$broadcast('state.started', states);
        }

        $scope.$watchCollection('editor.source', start);
        $scope.$on('state.step', step);
        $scope.$on('state.reset', start);
        $scope.$on('state.get', function (ev, res) {
            res.states = states;
        });
    });