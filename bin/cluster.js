#!/usr/bin/env node
var Cluster = require('../cluster.js'),
    argv = require('yargs').argv;

var help = 'Cluster.js help: \n\n' +
           'Usage: clusterjs [path to app] [options] \n\n' +
           'Options:\n'+
           ' --workers\t Defines how many workers we should launch (Default: CPU count)\n' +
           ' --reloadon\t On Which signal will the cluster be reloaded (Default: SIGUSR2)' +
            '\n\n';

var workers = argv.workers  || require('os').cpus().length;
var reloadSignal = argv.reloadon || 'SIGUSR2';
var appName = argv['_'][0] || process.env.APP || null;

if (appName === null || argv.help) {
    console.log(help);
    process.exit();
} else {
    console.log('Booting a cluster of ' + appName);
    console.log('We are gonna be launching ' + workers + ' workers');
    console.log('The cluster will reload on: ' + reloadSignal);
}

Cluster(appName, workers, reloadSignal);