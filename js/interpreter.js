angular.module('Befunge')
    .factory('interpreter', function ($q, $timeout) {
        return function(code, requestUpdates) {
            var worker = new Worker("/js/interpWorker.js");
            var started = false;
            var done = false;
            var requestedCancel = false;
            worker.addEventListener('message', function (event) {
                var data = event.data;
                if(data === "start") {
                    started = true;
                    if(requestedCancel)
                        cancel();
                } else if(data === "done") {
                    q.resolve();
                } else if(data.charAt(0) === 'E') {
                    q.reject(data.substr(1));
                } else {
                    q.notify(JSON.parse(data));
                }
            });
            worker.addEventListener('error', function (event) {
                done = true;
                q.reject({error:event.message});
            });

            var q = $q.defer();
            worker.postMessage({
                code: code,
                requestUpdates: requestUpdates
            });
            function cancel() {
                if(!started) {
                    requestedCancel = true;
                } else if(!done) {
                    worker.terminate();
                    done = true;
                }
            }
            return { promise: q.promise, cancel: cancel };
        }
    });