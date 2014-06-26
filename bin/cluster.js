#!/usr/bin/env node
var Cluster = require('../cluster.js'),
    argv = require('yargs').argv,
    debug = require('debug')('cluster.js-bin');

console.log(argv._);


var help = 'Cluster.js Command Help: \n\n\n Usage: clusterjs [appname] [options] \n\n Options: \n --workers\t Defines how many workers we should launch (Default: CPU count)\n --reloadon\t On Which Signal wohoiuld the cluster be rreloaded (Default: SIGUSR2)';



var workers = argv.workers  || require('os').cpus().length;
var reloadSignal = argv.reloadon || 'SIGUSR2';
var appName = argv['_'][0] || process.env.APP || null;

debug('Cluster starting:: Appname->'+appName+'. Launching '+workers+' workers. Cluster will reload on: '+reloadSignal);

if (appName === null) {
    console.error('You need to supply an App name!');
    console.log(help);
    process.exit();
}

Cluster(appName, workers, reloadSignal);