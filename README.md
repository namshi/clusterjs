# ClusterJS
An handy tool for your node servers and 0 downtime needs.

Cluster.js will take your app and spawn it in a node-cluster with how many workers you want.

You can reload the cluster sending a signal: clusterjs will go through all your workers, reloading one of them and waiting until it's listen on the wire before restarting another untill the whole cluster is done.


## Installation
```
git clone git://github.com/namshi/clusterjs.git
```

## Usage

### As a module library
```javascript
    var clusterjs = require('clusterjs');
    
    cluster('./app.js', 5, 'SIGUSR2');
```

### On your command line
If you already have a server app you can leverage on cluster.js' hand shell command.
Install it either globally or as a local module.

if you installed it as a module you'll need a little export in your path:
```
export PATH='$PATH:./node_modules/clusterjs/bin/'
```
and enjoy your command :)
```
cluster.js ./app --workers 5 --reloadon SIGUSR2
```
* help:
```
cluster.js --help
```
* restarting: 
Send your cluster's pid  your chosen signal.
Ex:
```
kill -SIGUSR2 <cluster's pid>
```

## Quick test:
You can use the simple dummy server included in the `tests/testApp` directory if you need to experiment.

## Thanks to

Well, the biggest effort was made by
[Jonathan Warner](http://jaxbot.me/articles/zero_downtime_nodejs_reloads_with_clusters_7_5_2013)
who explained how easily you could achieve ZDD
with node.

We polished the code a bit as we found out
that it had some glitches but the main idea remains
the same (so yeah, thanks Jax!).

## License

ClusterJS is released under the MIT license.

