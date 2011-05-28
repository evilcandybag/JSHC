// -----------------------------------------------------------------------------
// lazy evaluation

JSHC.Thunk = function (exp) {
    assert.ok( ! (exp instanceof JSHC.Thunk) );
    this.v = exp
}

JSHC.Thunk.prototype = {
    get v(){
            
        if (this._v instanceof Function && this._v.length === 0) {
            this.v = this._v();
        }
        
        //if (this._v instanceof JSHC.Thunk) {
        //    this.v = this._v.v;
        //}
        
        return this._v;
    },
    set v(val){
        this._v = val;
    }
};
JSHC.Thunk.prototype.toString = function() {
    return this.v.toString();
};

/*
// TODO: need to have a way to handle functions of arbitrary arity.
function thunk_computation_a1(f){
  return function(thunk){
    var result = f(JSHC.TR(thunk.a[0]));
    delete thunk.as;
    return result;
  }
}
function thunk_computation_a2(f){
  return function(thunk){
    var result = f(JSHC.TR(thunk.as[0]),JSHC.TR(thunk.as[1]));
    delete thunk.as;
    return result;
  }
}
function thunk_computation_a3(f){
  return function(thunk){
    var result = f(JSHC.TR(thunk.a1),JSHC.TR(thunk.a2),JSHC.TR(thunk.a3));
    delete thunk.a1;
    delete thunk.a2;
    delete thunk.a3;
    return result;
  }
}
JSHC.TC1 = thunk_computation_a1
JSHC.TC2 = thunk_computation_a2
JSHC.TC3 = thunk_computation_a3
*/

// create and see if thunks work correctly.
//function test_thunk(){
//  // create thunk for "1 + 2"
//  var args = [JSHC.TS(1),JSHC.TS(2)]
//  var f = function(a){return JSHC.TR(a[0])+JSHC.TR(a[1])}
//  var t = JSHC.TC(f,args);

//  // must only contain the computation and arguments before being evaluated
//  JSHC.assert(getKeys(t) == "c,as", "not 'c' and 'as' in thunk");

//  var result = JSHC.TR(t)
//  JSHC.assert(result === 3, "not correct result. got: "+result);

//  // must only contain the value after being evaluated
//  JSHC.assert(getKeys(t) == "v", "not 'v' in thunk");
//}
//test_thunk();
