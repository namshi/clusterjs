# ClusterJS

An handy tool for your node servers and 0 downtime needs.

Cluster.js will take your app and spawn it in a node-cluster with how many workers you want.

You can reload the cluster sending a signal: clusterjs will go through all your workers,
reloading one of them and waiting until it's listen on the wire before restarting another
until the whole cluster is done.


## Installation

It is recommended to install the package globally:

```
npm install -g clusterjs
```

## Usage

Suppose you have an app running on a `index.js` file, you
can simply decide to start it with clusterjs:

```
clusterjs ./app
```

This will start a cluster of as many apps as CPU cores you
have on your machine: to change the number of workers, simply
specify it when launching the cluster:

```
clusterjs ./app --workers 5
```

You can reload the cluster, achieving **zero-downtime deployments** by
issuing a `SIGUSR` command to the master process:

```
~/projects/clusterjs (master ✔) ᐅ ps aux | grep cluster.js
odino    29571  2.0  0.1 659236 10440 pts/4    Sl+  23:21   0:00 node ./bin/cluster.js test/testApp/app.js
odino    29573  1.5  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
odino    29574  2.0  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
odino    29576  1.5  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
odino    29577  1.5  0.1 656160  8564 pts/4    Sl+  23:21   0:00 /home/local/bin/node /home/projects/clusterjs/bin/cluster.js test/testApp/app.js
odino    29582  0.0  0.0  13636   984 pts/5    S+   23:21   0:00 grep cluster.js

~/projects/clusterjs (first-release ✔) ᐅ kill -SIGUSR2 29571
```

This will gracefully reload your cluster, causing your app to be updated
without any downtime.

You can also customize the signal used to reload the cluster:

```
clusterjs ./app --workers 5 --reloadon SIGUSR2
```

### As a module library

You can also use cluster.js as a module in your userland
code by simply requiring it:

``` javascript
var clusterjs = require('clusterjs');

cluster('./app.js', 5, 'SIGUSR2');
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

