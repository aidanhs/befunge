angular.module('Befunge')
    .directive('timeline', function ($interval) {
        return {
            templateUrl: "views/timeline.html",
            scope: true,
            link: function (scope) {
                scope.player= null;
                scope.maxStateIndex = 0;
                scope.curStateIndex = 0;
                scope.states = [];
                scope.state = {};

                scope.$watch('curStateIndex', function (idx) {
                    scope.state = scope.states[idx];
                });

                // event handling
                function updateScrubber() {
                    scope.curStateIndex = scope.maxStateIndex = scope.states.length - 1;
                }
                scope.$on('state.changed', function (ev, states) {
                    scope.states = states;
                    updateScrubber();
                });
                scope.$on('state.started', function (ev, states) {
                    scope.stop();
                    scope.states = states;
                    updateScrubber();
                });
                scope.$on('state.done', function (ev, states) {
                    scope.stop();
                    scope.states = states;
                    updateScrubber();
                });

                // actions
                scope.step = function(amount) {
                    var cur = scope.curStateIndex += amount;
                    if(cur < 0) {
                        scope.curStateIndex = 0;
                    } else if(cur > scope.maxStateIndex) {
                        scope.curStateIndex = scope.maxStateIndex;
                        scope.$emit('state.step');
                    }
                };
                scope.play = function () {
                    if(scope.player) return;
                    scope.player = $interval(function () {
                        scope.step(1);
                    }, 50);
                    scope.step(1);
                };
                scope.stop = function () {
                    if(scope.player) {
                        $interval.cancel(scope.player);
                        scope.player = null;
                    }
                };
                scope.reset = function () {
                    scope.stop();
                    scope.$emit('state.reset');
                };

                // init
                var res = {};
                scope.$emit('state.get', res);
                scope.states = res.states;

                // cleanup
                scope.$on('$destroy', function () {
                    scope.stop();
                });
            }
        }
    });