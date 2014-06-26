console.log('--- test app loaded as pid: ' + process.pid);

require('http').createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('blah');
}).listen(9615);