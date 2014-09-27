angular.module('Befunge')
    .factory('interpreter', function ($q, $timeout) {
        return function(code, requestUpdates) {
            var worker = new Worker("/js/interpWorker.js");
            var started = false;
            var done = false;
            var requestedCancel = false;
            worker.addEventListener('message', function (event) {
                if(event.data === "start") {
                    started = true;
                    if(requestedCancel)
                        cancel();
                } else {
                    var data = JSON.parse(event.data);
                    if (data.done) {
                        done = true;
                        if ('error' in data)
                            q.reject(data);
                        else
                            q.resolve(data);
                    } else {
                        q.notify(data);
                    }
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