# ClusterJS
An handy tool for your 0 downtime needs.
Cluster.js will take your app and spawn it in a node-cluster with how many workers

## Installation
```
git clone git://github.com/namshi/clusterjs.git
```

## Usage

### As a module
make sure your application exports its self a a module and include cluster.js in you entry point script:

```javascript
    var clusterjs = require('clusterjs');
    
    cluster('./app.js', 5, 'SIGUSR2');
```

### On your command line

```
export PATH='$PATH:./node_modules/clusterjs/bin/'

cluster.js ./app --workers 5 --reloadon SIGUSR2

```
* help:
```
cluster.js --help
```

## Tests

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

