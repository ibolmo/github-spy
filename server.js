var express = require('express');

process.on('exit', function(){
  console.log('%s: Node server stopped.', Date());
});

// Removed 'SIGPIPE' from the list - bugz 852598.
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(signal) {
  console.log('%s: Received %s - terminating sample app ...', Date(), signal);
  process.exit(1);
});

var app = express.createServer();

app.get('/', function(req, res) {
  res.send('');
});

var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var PORT       = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(PORT, IP_ADDRESS, function() {
  console.log('%s: Node server started on %s:%d ...', Date(), IP_ADDRESS, PORT);
});
