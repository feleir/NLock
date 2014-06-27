(function () {
    'use strict';
	var getArray = function (size) {
		var a = [],i = 0;
			for (;i<size;i++) {
				a[i] = i;
			}
		return a;
	}

	function forEach(array, func, done) {
		array.forEach(function(i) {
			func(i);
		});
		done();
	}

	function forLoop(array, func, done) {
		var i = 0, length = array.length;
		for (;i<length;i++) {
			func(array[i]);
		}
		done();
	}

	function asyncArrayProcess(timeout) {
		return function(array, func, done) {
			for(var i = 0, length = array.length - 1; i <= length; i++) 
			{
				(function(idx) {
					timeout(function() {
						func(array[idx]);
						if (idx === length)
							done();
					});
				}(i));
			}		
		}
	}

	var asyncSetImmediate = asyncArrayProcess(setImmediate);
	var asyncSetTimeout = asyncArrayProcess(setTimeout);
	var asyncNextTick = asyncArrayProcess(process.nextTick);
	var asyncNoTimeout = asyncArrayProcess(function(func) { func(); });

	var start = new Date();
	function testForEach(name, func, idx) {
		console.log('Calling ' + name + ' ' + idx);

		func(getArray(100000), function(i) { }, function() {
			var elapsed = new Date() - start;
			console.log(name + (idx ? ' ' + idx : '') + ' took ' + elapsed + " s, " + elapsed.toFixed(2) + " ms"); 	
		});
	}


	testForEach('forEach', forEach, 1); // This one blocks
	testForEach('forLoop', forLoop, 1); // This one blocks
	testForEach('asyncSetImmediate', asyncSetImmediate, 1);
	testForEach('asyncSetImmediate', asyncSetImmediate, 2);
	testForEach('asyncNextTick', asyncNextTick, 1);
	testForEach('asyncNextTick', asyncNextTick, 2);
	testForEach('asyncSetTimeout',asyncSetTimeout, 1);
	testForEach('asyncSetTimeout',asyncSetTimeout, 2);
	// testForEach('forEach', forEach, 2);
	// testForEach('forLoop', forLoop, 2);   // this function is strict...
}());


