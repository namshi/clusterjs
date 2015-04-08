var cluster = require('cluster');
var path    = require('path');
var fs      = require('fs');
var _       = require('lodash');
var deaths  = [];

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

    console.log('shutting down worker: ' + workerKey);

    stopWorker(workerKey, function () {
        if (workers.length > 0) {
            shutdownWorkers(workers);
        } else {
            process.exit();
        }
    });
}


/**
 * Figures out the correct path for the app.
 *
 * @param appPath
 * @returns {*}
 */
function findAppScript(appPath) {
    var prefix = (appPath.indexOf('/') !== 0) ? process.cwd() : '';
    appPath = path.join(prefix, appPath);

    if (fs.existsSync(appPath)) {
        return appPath;
    } else {
        throw new Error('Cannot find required app');
    }
}

/**
 * Calculates the delay we should wait for
 * when booting a replacement worker.
 * Sometimes your scripts cannot really start
 * (DB is down, etc) and clusterjs ends
 * up consuming a lot of CPU trying to
 * restart them forever.
 * 
 * If your workers die too fast, we will
 * wait 250ms for each of them that died
 * in the past 10s.
 * To optimize calculations, we delete deaths
 * that happened more than 10s ago.
 * 
 * If only 1 worker has died in the past 10s,
 * we skip the delay as it might be a
 * genuine / regular death.
 */
function calculateDelay() {
  var interval = 250;
  var now = (new Date()).getTime();
  var delay = _.sum(_.map(deaths, function(death, index){
    if (now - death < 10000) {
      return interval;
    }
    
    deaths.splice(index, 1);
    return 0;
  }));
  
  if (delay === interval) {
    delay = 0;
  }
  
  console.log('Going to wait ' + delay / 1000  + ' seconds before booting a new worker as we died ' + deaths.length + ' times in the past seconds');
  deaths.push(now)
  
  return delay;
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

    appPath         = findAppScript(appPath || process.env.APP);
    noOfWorkers     = noOfWorkers || require('os').cpus().length;
    reloadSignal    = reloadSignal || "SIGUSR2";

    console.log('appPath', appPath);

    if (cluster.isMaster) {
        // Create a worker for each CPU
        for (var i = 0; i < noOfWorkers; i += 1) {
            cluster.fork();
        }

        // Listen for dying workers
        cluster.on('exit', function (worker) {
            // A suicide means we shutdown the worker on purpose
            // like in a deployment
            if (worker.suicide !== true) {
                setTimeout(function(){
                  console.log('Worker ' + worker.id + ' died :( ...booting a replacement worker');
                  cluster.fork();
                }, calculateDelay());
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
 * @param {String} appPath
 * @param {Number} noOfWorkers
 * @param {String} reloadSignal
 */
module.exports = function(appPath, noOfWorkers, reloadSignal) {
    launch(appPath, noOfWorkers, reloadSignal);
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGQUIT', gracefulShutdown);
};
