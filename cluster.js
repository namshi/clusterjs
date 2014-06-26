var cluster = require('cluster'),
    debugModule = require('debug')('cluster.js-module'),
    debugLauncher = require('debug')('cluster.js-launcher'),
    debugWorkerRestarter = require('debug')('cluster.js-restarter');

/**
 * Restarts a list of clustered server.
 * waits for each worker server to come up
 * so we have 0 downtime.
 *
 * @param {Object} cluster
 * @param {Array} workers
 */
function restartWorkers(cluster, workers) {
    var workerKey = workers.shift();

    debugWorkerRestarter('restarting worker: '+workerKey);

    cluster.workers[workerKey].disconnect();
    cluster.workers[workerKey].on("disconnect", function () {
        debugWorkerRestarter("Shutdown complete for worker " + workerKey);
    });
    var newWorker = cluster.fork();
    newWorker.on("online", function () {
        debugWorkerRestarter("Replacement worker online.");
        if (workers.length > 0) {
            restartWorkers(cluster, workers);
        }
    });
}

/**
 * Takes care of launching our cluster
 * master process and it's children
 *
 * @param {String} appPath
 * @param {Number} noOfWorkers
 * @param {String} reloadSignal
 */
function launch (appPath, noOfWorkers, reloadSignal) {
    appPath = appPath || process.env.APP || null;
    noOfWorkers = noOfWorkers || require('os').cpus().length;
    reloadSignal = reloadSignal || "SIGUSR2";

    if (appPath === null) {
        throw new Error('Please provide a path to your app. You can either pass it as a parameter or as process.env.APP');
    }

    if (cluster.isMaster) {
        // Create a worker for each CPU
        for (var i = 0; i < noOfWorkers; i += 1) {
            cluster.fork();
        }

        // Listen for dying workers
        cluster.on('exit', function (worker) {
            debugLauncher('Worker ' + worker.id + ' died :(');
            // A suicide means we shutdown the worker on purpose
            // like in a deployment
            if (worker.suicide !== true) {
                cluster.fork();
            }
        });

        process.on(reloadSignal, function () {
            debugLauncher(reloadSignal + 'received, this means we are deploying and want to reload the app');

            // delete the cached module, so we can reload the app
            delete require.cache[require.resolve(appPath)];

            // only reload one worker at a time
            // otherwise, we'll have a time when no request handlers are running
            var workers = Object.keys(cluster.workers);
            restartWorkers(cluster, workers);
        });
    } else {
        try {
            var app = require(appPath);
        } catch(error){}

        debugLauncher('Worker ' + cluster.worker.id + ' running!');
    }
}

/**
 * This is how the world sees us
 *
 * @param {String} app
 * @param {Number} noOfWorkers
 * @param {String} reloadSignal
 */
module.exports = function(app, noOfWorkers, reloadSignal){
    debugModule('Thank you for using Cluster.js!');
    launch(app, noOfWorkers, reloadSignal);
};