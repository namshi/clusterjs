var cluster = require('cluster');

/**
 * Restarts a list of clustered server.
 * waits for each worker server to come up
 * so we have 0 downtime.
 *
 * @param {Object} cluster
 * @param {Array} workers
 */
function reloadWorkers(cluster, workers) {
    var workerKey = workers.shift();
    var newWorker = cluster.fork();

    console.log('restarting worker: '+workerKey);

    cluster.workers[workerKey].disconnect();
    cluster.workers[workerKey].on("disconnect", function () {
        console.log("Shutdown complete for worker " + workerKey);
    });

    newWorker.on("listening", function () {
        console.log("Replacement worker online.");
        if (workers.length > 0) {
            reloadWorkers(cluster, workers);
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
            console.log('forking');
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

        process.on(reloadSignal, function () {
            console.log(reloadSignal + 'received, this means we are deploying and want to reload the app');

            // delete the cached module, so we can reload the app
            delete require.cache[require.resolve(appPath)];

            // only reload one worker at a time
            // otherwise, we'll have a time when no request handlers are running
            var workers = Object.keys(cluster.workers);
            reloadWorkers(cluster, workers);
        });
    } else {
        var app = require(appPath);
        console.log('Worker ' + cluster.worker.id + ' running!');
    }
}

/**
 * This is how the world sees us
 *
 * @param {String} app
 * @param {Number} noOfWorkers
 * @param {String} reloadSignal
 */
module.exports = function(app, noOfWorkers, reloadSignal) {
    launch(app, noOfWorkers, reloadSignal);
};