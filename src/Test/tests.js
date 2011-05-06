
// requires src/Test/utility.js

if( JSHC.Test.Tests === undefined )JSHC.Test.Tests = {};

////////////////////////////////////////////////////////////////////////////////

JSHC.Test.Tests.unparsable = function(){
    // TODO
    return {};
}();

JSHC.Test.Tests.parsable = function(){
    var l;
    var ls = new JSHC.Test.Cases.parsable();
    var ts = {};
    var number = 0;

    var action = function(){
	try{
	    var ast = JSHC.parse(this.input);
	    return this.result(true, ast);
	}catch(err){
	    return this.result(false, err);
	}
    };

    for(l in ls){
	var strings = ls[l];
	strings.forEach(function(input){
	    var tc = new JSHC.Test.TestCase("parsable"+(number++),action);
	    tc.input = input;
	    ts[tc.name] = tc;
	});
    }
    
    return ts;
}();

JSHC.Test.Tests.codegen = function() {
    var l;
    var ls = new JSHC.Test.Cases.codegen();
    var ts = {};
    var number = 0;

    var action = function(){
	try{
	    var prog = JSHC.Compile.compile(this.input.p);
	    
        eval(prog);
        var com = eval(this.input.r);
        if (com === this.input.e) {
            return this.result(true,prog);
        } else {
            var msg = "expected: " + this.input.e + " got: " + com;
            return this.result.false,msg
        }
	}catch(err){
	    return this.result(false, err);
	}
    };

    for(l in ls){
	var strings = ls[l];
	strings.forEach(function(input){
	    var tc = new JSHC.Test.TestCase("codegen"+(number++),action);
	    tc.input = input;
	    ts[tc.name] = tc;
	});
    }
    
    return ts;
}();


////////////////////////////////////////////////////////////////////////////////

/*
JSHC.Test.Tests.simple = function(){
    var strings = [
	"x = y\ny = x",
	"x = x",
	"f f = f"];

    var okModuleString = function(){
	var r = JSHC.compileModules(JSHC.Load.loadString(this.input))
	return this.result(r.errors.length === 0 && r.warnings.length === 0,r);
    };

    var tests = {};

    strings.forEach(function(input,i){
	var test = new JSHC.Test.TestCase("t"+i, okModuleString);
	test.input = input;
	tests[test.name] = test;
    });

    return tests;
}();
*/

////////////////////////////////////////////////////////////////////////////////

