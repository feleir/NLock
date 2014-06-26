'use strict';

var cluster = require('cluster');

if (cluster.isMaster) {
	var numCPUs = require('os').cpus().length,
		lock = require('./lib/lock');
		
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('fork', function(worker) {
		console.log('worker ' + worker.process.pid + ' fork');
	});
	cluster.on('listening', function(worker, address) {
		console.log('worker ' + worker.process.pid + ' listening');
	});
	cluster.on('online', function(worker) {
		worker.send('test');
	});
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else if (cluster.isWorker) {
	
	process.on('message', function(msg) {
    	console.log(msg);
  	});
	console.log('worker ' + process.pid + ' started');
}