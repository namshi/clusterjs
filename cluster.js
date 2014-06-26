//require('newrelic');
var cluster = require('cluster'),
    debug = require('debug')('cluster.js-lib');

function launch (reloadSignal) {
    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;

        // Create a worker for each CPU
        for (var i = 0; i < cpuCount; i += 1) {
            cluster.fork();
        }

        // Listen for dying workers
        cluster.on('exit', function (worker) {
            console.log('Worker ' + worker.id + ' died :(');
            // A suicide means we shutdown the worker on purpose
            // like in a deployment
            if (worker.suicide !== true) {
                cluster.fork();
            }
        });

        process.on("SIGUSR2", function () {
            console.log("SIGUSR2 received, this means we are deploying and want to reload the app");

            // delete the cached module, so we can reload the app
            delete require.cache[require.resolve("./app")];

            // only reload one worker at a time
            // otherwise, we'll have a time when no request handlers are running
            var i = 0;
            var workers = Object.keys(cluster.workers);

            var f = function () {
                if (i == workers.length) return;

                console.log("Killing " + workers[i]);

                cluster.workers[workers[i]].disconnect();
                cluster.workers[workers[i]].on("disconnect", function () {
                    console.log("Shutdown complete for worker " + i);
                });
                var newWorker = cluster.fork();
                newWorker.on("listening", function () {
                    console.log("Replacement worker online.");
                    i++;
                    f();
                });
            }
            f();
        });
    } else {
        var app = require('./app');
        console.log('Worker ' + cluster.worker.id + ' running!');
    }
}
module.exports = function(appName, noOfWorkers, reloadSignal){
    debug('doing things');
};