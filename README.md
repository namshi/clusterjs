# ClusterJS

An handy tool for your node servers and 0 downtime needs.

ClusterJS will take your app and spawn it in a node-cluster with as many workers you want.

You can reload the whole cluster sending a simple signal: ClusterJS will go
through all your workers, reloading them one by one.

```
~/projects/clusterjs (master ✔) ᐅ clusterjs
Cluster.js help:

Usage: clusterjs [path to app] [options]

Options:
 --workers	 Defines how many workers we should launch (Default: CPU count)
 --reloadon	 On Which signal will the cluster be reloaded (Default: SIGUSR2)
```

## Installation

It is recommended to install the package globally:

```
npm install -g clusterjs
```

## Usage

Suppose you have an app running on an `app.js` file, you
can simply decide to start it with clusterjs:

```
clusterjs app.js
```

This will start a cluster of as many apps as CPU cores you
have on your machine; to change the number of workers, simply
specify it when launching the cluster:

```
clusterjs app.js --workers 5
```

**WARNING** if your path contains a symlink, clusterjs will need the full path to your app

```
clusterjs /path/to/your/app.js
```

You can reload the cluster, achieving **zero-downtime deployments** by
issuing a `SIGUSR2` command to the master process:

```
~/projects/clusterjs (master ✔) ᐅ ps aux | grep cluster.js
29571  2.0  0.1 659236 10440 pts/4    Sl+  23:21   0:00 node ./bin/cluster.js test/testApp/app.js
29573  1.5  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
29574  2.0  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
29576  1.5  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
29577  1.5  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
29582  0.0  0.0  13636   984 pts/5    S+   23:21   0:00 grep cluster.js

~/projects/clusterjs (master ✔) ᐅ kill -SIGUSR2 29571
```

This will gracefully reload your cluster, updating the app
without any downtime.

You can also customize the signal used to reload the cluster:

```
clusterjs app.js --workers 5 --reloadon SIGUSR2
```

If you want to actually shutdown the app, simply issue a `SIGTERM` or
a `SIGQUIT` (ie. `kill 29571`).

## As a module

You can also use cluster.js as a module in your userland
code by simply requiring it:

``` javascript
var clusterjs = require('clusterjs');

cluster('app.js', 5, 'SIGUSR2');
```

## Have a closer look

You can use the simple dummy server included in the
`tests/testApp` directory if you need to experiment:

```
git clone git@github.com:namshi/clusterjs.git

cd clusterjs

./bin/cluster.js test/testApp/app.js
```

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

