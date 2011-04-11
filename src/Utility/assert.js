
/*
http://wiki.commonjs.org/wiki/Unit_Testing/1.0
TODO: make a module. see http://wiki.commonjs.org/wiki/Modules/1.1
*/

assert = {};

assert.AssertionError = function(obj){
    //Error.call(this);
    //for(var k in this){
    //   document.write("key:"+k+",value:"+this[k]+"<br>");
    //}
    var err = new Error();  // error object used to initialize some members
    //if(this.stack === undefined)alert("no stack");
    //document.write(this.stack);

    // message, fileName, lineNumber, stack, name
    for(var k in err){
       this[k] = err[k];
       //document.write("key:"+k+",value:"+err[k]+"<br>");
    }

    this.name = "AssertionError";

    if( obj !== undefined ){
        this.message = obj.message;
        this.actual = obj.actual;
        this.expected = obj.expected;
    } else {
        // use default empty message from Error class.
        //this.message = err.message;
    }
};
assert.AssertionError.prototype = new Error(); //Error.prototype;
//assert.AssertionError.prototype.name = "Error";
//assert.AssertionError.prototype.constructor = assert.AssertionError;

assert.ok = function(guard, message){
    assert.equal(guard, true, message);
};

assert.equal = function(actual, expected, message){
    if( actual == expected ){
	return;
    }
    throw new assert.AssertionError({message: message,
				     actual: actual,
				     expected: expected});
};

assert.notEqual = function(actual, expected, message){
    if( actual != expected ){
	return;
    }
    throw new assert.AssertionError({message: message,
				     actual: actual,
				     expected: expected});
};
/*
assert.deepEqual = function(actual, expected, message){
    if( actual === expected )return;
    if( typeof actual == "object" &&
	typeof expected == "object" ){

	if( actual.prototype !== undefined &&
	    actual.prototype.hasOwnProperty !== undefined &&
	    expected.prototype !== undefined &&
	    expected.prototype.hasOwnProperty !== undefined &&
	    actual.prototype.hasOwnProperty.call !==
            expected.prototype.hasOwnProperty.call )
	    return;
	if( actual.prototype !== expected.prototype )
	    return;

	//check if same set of keys and equivalent values for every key pair.
	var ok = true;
	for(var key in actual){
	    //assert.deepEqual
	};
	if( ok )return;

	throw new assert.AssertionError({message: message,
					 actual: actual,
					 expected: expected});
    } else {
	assert.equal(actual, expected, message);
    }
};
*/
