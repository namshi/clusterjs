# ClusterJS
An handy tool for your 0 downtime needs.
Cluster.js will take your app and spawn it in a node-cluster with how many workers

## Installation
```
git clone git://github.com/namshi/clusterjs.git
```

## Usage

### As a module
Make sure your application exports its self a a module and include cluster.js in you entry point script:

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
* restarting
Send your cluster's pid  your chosen signal.
Ex:
```
kill -SIGUSR2 <cluster's pid>
```
* output
By default cluster.js will not give output.
You can ask for output by prepanding the `DEBUG=` var when  you run it:

```
DEBUG=* cluster.js ./app --workers 5 --reloadon SIGUSR2
```

there are 5 kind of outputs you can obtain:
* `DEBUG=cluster.js-bin`: will give infos about the command launched
* `DEBUG=cluster.js-module`: will output how the module was invoked
* `DEBUG=cluster.js-launcher`: will give information about the process been lanuched
* `DEBUG=cluster.js-restarter`: will output when the worker are restarterd (upon signal)
* `DEBUG=*`: will print all the debugs together

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

