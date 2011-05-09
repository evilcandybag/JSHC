
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
    this.interpreter = new JSHC.Interpreter("JSHC.Test.modules");
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
    
    //tester = this;
    //var resultHandler = function(result){
    //    tester.addResult(result);
    //};

    fun(this);
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
	if( r.info === undefined || r.info.length == 0 ){
	    msg.push("(no information)");
	} else {
            msg.push(r.info);
	}
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
	msg.push("name: "+r.getName()+"<br>");
	if( r.info === undefined || r.info.length == 0 ){
	    msg.push("(no information)");
	} else {
            // TODO: should somehow convert to HTML ?
            msg.push(r.info.replace(/\n/g,"<p>"));
	}
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

/*
  run test tests using test data
*/
JSHC.Test.runData = function(tester,td){
    assert.ok( td.fileSystem !== undefined );

    // set file system
    tester.interpreter.compiler.setFileSystem(td.fileSystem);

    // set targets
    if( td.targets === undefined ){
       var targets = [];
       for(var modname in td.fileSystem){
          targets.push(modname);
       }
    } else {
       targets = td.targets;
    }
    tester.interpreter.compiler.setTargets(targets);

    // compile
    tester.interpreter.compiler.recompile();

    var errorAmount;
    if( td.errors === undefined ){
        errorAmount = 0;
    } else {
        errorAmount = td.errors;
    }

    var info = [];
    if( tester.interpreter.errors !== errorAmount ){
        for(var i=0 ; i<tester.interpreter.errorList.length ; i++){
            var err = tester.interpreter.errorList[i];
            if( typeof err !== "string" ){
                err = JSHC.showError(err);
            }
            info.push(err);
        }
    }

    var success = tester.interpreter.errors === errorAmount;

    var commands = td.commands;
    for(var command in commands){
        tester.interpreter.execCommand(command);
        if( tester.interpreter.messageList.length !== 1 ){
            success = false;
            info.push("got more than one result when executing \""+command+"\"");
            continue;
        }
        if( tester.interpreter.messageList[0] !== commands[command] ){
            success = false;
            info.push("got result \""+tester.interpreter.messageList[0]+"\""+
                      " instead of \""+commands[command]+"\" when executing "+
                      "\""+command+"\"");
            continue;
        }
    }

    tester.addResult(new JSHC.Test.TestResult(
        td.name,
        tester.interpreter.errors === errorAmount,
        info.length==0 ? [] : info.join("\n")));
};

////////////////////////////////////////////////////////////////////////////////
