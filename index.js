'use strict';

var Q = require('q'),
	lock = require('./lock');

function testLock(i, max) {
	lock(function(done) {
		setTimeout(function() {
			process.stdout.write(i.toString() + (i !== max ? '-' : '\n\r'));
			done();
		}, Math.random()*100);
	});
}

function testNoLock(i, max) {
	setTimeout(function() {
		process.stdout.write(i.toString() + (i !== max ? '-' : '\n\r'));
	}, Math.random()*100);
}

console.log('usage: [nolock, optional]');

var fun = testLock;

if (process.argv.length === 3 && process.argv[2] == 'nolock') {
	fun = testNoLock;
} 

for (var i=0;i<=100;i++)
{
	fun(i,100);
}