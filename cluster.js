var cluster = require('cluster');
var path    = require('path');

/**
 * Stops a worker, waits for it to disconnect
 * and gives control back.
 *
 * @param workerKey
 * @param callback
 */
function stopWorker(workerKey, callback){
    cluster.workers[workerKey].disconnect();
    cluster.workers[workerKey].on("disconnect", function () {
        console.log("Shutdown complete for worker " + workerKey);
        callback();
    });
}

/**
 * Restarts a list of clustered server.
 * waits for each worker server to come up
 * so we have 0 downtime.
 *
 * @param {Array} workers
 */
function reloadWorkers(workers) {
    console.log('*** reloading workers!');
    var workerKey = workers.shift();
    var newWorker = cluster.fork();

    console.log('restarting worker: ' + workerKey);

    stopWorker(workerKey, function () {
        var newWorker = cluster.fork();
        newWorker.on("listening", function () {
            console.log("Replacement worker online.");
            if (workers.length > 0) {
                reloadWorkers(workers);
            }
        });
    });
}


/**
 * stops every worker one at a time waiting before killing the next
 *
 * @param workers
 */
function shutdownWorkers(workers) {
    var workerKey = workers.shift();
    var newWorker = cluster.fork();

    console.log('restarting worker: ' + workerKey);

    stopWorker(workerKey, function () {
        if (workers.length > 0) {
            shutdownWorkers(workers);
        } else {
            process.exit();
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
    if (appPath === null) {
        throw new Error('Please provide a path to your app. You can either pass it as a parameter or as process.env.APP');
    }

    appPath         = path.join(process.cwd(), appPath || process.env.APP);
    noOfWorkers     = noOfWorkers || require('os').cpus().length;
    reloadSignal    = reloadSignal || "SIGUSR2";

    if (cluster.isMaster) {
        // Create a worker for each CPU
        for (var i = 0; i < noOfWorkers; i += 1) {
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

        process.on(reloadSignal, function () {
            console.log(reloadSignal + ' received, reloading the app');

            // delete the cached module, so we can reload the app
            delete require.cache[require.resolve(appPath)];
            console.log('The app has been reloaded');

            // only reload one worker at a time
            // otherwise, we'll have a time when no request handlers are running
            var workers = Object.keys(cluster.workers);
            reloadWorkers(workers);
        });
    } else {
        var app = require(appPath);

        console.log('Worker ' + cluster.worker.id + ' running!');
    }
}

/**
 * lists the workers and inits the graceful shutdown procedure
 */
function gracefulShutdown(){
    console.log('*** shutting down gracefully');
    var workers = Object.keys(cluster.workers);
    shutdownWorkers(workers);
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
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGQUIT', gracefulShutdown);
};
