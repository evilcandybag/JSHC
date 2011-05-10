
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
	    return this.result(true);
	}catch(err){
	    return this.result(false, JSHC.showError(err));
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

