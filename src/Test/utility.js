
// requires assertions

if( JSHC.Test === undefined ) JSHC.Test = {};
if( JSHC.Test.Cases === undefined) JSHC.Test.Cases = {};
////////////////////////////////////////////////////////////////////////////////

/*
  can be created with:
  (name, action)
  (name, action, obj) where 'obj' contains extra properties to copy
  (obj) where 'obj' contains properties to copy (including name and action)
*/
JSHC.Test.TestCase = function(p1, p2, p3){
    var k;

    if( typeof p1 === "string" && p2 instanceof Function ){
	this.name = p1;
	this.action = p2;
	for(k in p3){
	    if( k === "name" || k === "action" ){
		throw new Error("invalid parameters");
	    }
	    this[k] = p1[k];
	}
    } else if( p1 !== undefined &&
	       typeof p1.name === "string" &&
	       p1.action instanceof Function ) {
	for(k in p1){
	    this[k] = p1[k];
	}
    } else {
	throw new Error("invalid parameters");
    }
};

JSHC.Test.TestCase.prototype.result = function(ok, info){
    assert.ok( typeof ok === "boolean" && arguments.length <= 2 );
    return new JSHC.Test.TestResult(this, ok, info);
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Test.TestResult = function(id, ok, info){
    assert.ok( typeof ok == "boolean" );
    if( typeof id == "string" ){
        this.name = id;
    } else if( id instanceof JSHC.Test.TestCase ){
        this.tc = id;
    }
    this.ok = ok;
    if( info !== undefined ){
	this.info = info;
    }
};

JSHC.Test.TestResult.prototype.getName = function(){
    return this.name !== undefined ? this.name : this.tc.name;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Test.Tester = function(){
    this.results = {};
    this.passed = 0;
    this.failed = 0;
};

/*
  Makes a depth-first traversal over the test cases, and runs them.
*/
JSHC.Test.Tester.prototype.run = function(tests){
    var t;

    // run the single test case
    if( tests instanceof JSHC.Test.TestCase ){
	this.runTC(tests);
    } else if( tests instanceof Function ){
        this.runFunction(tests);
    } else {
        // run all test cases in the object
        for(t in tests){
	    this.run(tests[t]);
        }
    }
};

JSHC.Test.Tester.prototype.addResult = function(result){
    assert.ok( result instanceof JSHC.Test.TestResult );
    var name = result.getName();
    if( this.results[name] !== undefined ){
        throw new Error("test names overlap. \""+name+"\" exists more than once.");
    }
    this.results[name] = result;
    if( result.ok ){
        this.passed++;
    } else {
        this.failed++;
    }
};

/*
  Runs a single test case.
*/
JSHC.Test.Tester.prototype.runFunction = function(fun){
    assert.ok( fun instanceof Function );
    
    tester = this;
    var resultHandler = function(result){
        tester.addResult(result);
    };

    fun(resultHandler);
};

/*
  Runs a single test case.
*/
JSHC.Test.Tester.prototype.runTC = function(tc){
    assert.ok( tc instanceof JSHC.Test.TestCase );
    this.addResult(tc.action());
};

/*
  Shows test results.
*/
JSHC.Test.Tester.prototype.toString = function(tc){
    var rn,msg = [];
    msg.push("tests passed:" + this.passed + "\n");
    msg.push("tests failed:" + this.failed + "\n");
    msg.push("\n");
    for(rn in this.results){
	var r = this.results[rn];
	assert.ok( r instanceof JSHC.Test.TestResult );
	
	// ignore passed tests
	if( r.ok )continue;

	// show failed tests
	msg.push("name: "+r.name+"\n");
	msg.push(r.info);
	msg.push("\n\n");
    }
    return msg.join("");
};

/*
  Shows test results.
*/
JSHC.Test.Tester.prototype.toHTML = function(tc){
    var rn,msg = [];
    msg.push("<p>tests passed:" + this.passed + "<br>");
    msg.push("tests failed:" + this.failed + "<br>");
    msg.push("</p><hr>");
    for(rn in this.results){
	var r = this.results[rn];
	assert.ok( r instanceof JSHC.Test.TestResult );

	// ignore passed tests
	if( r.ok )continue;

	// show failed tests
	msg.push("name: "+r.tc.name+"<br>");
	msg.push(r.info);  // TODO: should somehow convert to HTML ?
	msg.push("<hr>");
    }
    return msg.join("");
};

////////////////////////////////////////////////////////////////////////////////

/*
  Runs the given tests and returns a string describing the results.
*/
JSHC.Test.runtests = function(tests, showHTML){
    var tester = new JSHC.Test.Tester();
    tester.run(tests);
    return showHTML ? tester.toHTML() : tester.toString();
};

////////////////////////////////////////////////////////////////////////////////

