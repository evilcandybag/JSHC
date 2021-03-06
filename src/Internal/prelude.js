//require Internal/Internal.js


// a fake prelude written directly in javascript

/* the original haskell source could have looked like:

(+) = JSHC.int32add
(-) = JSHC.int32sub
(*) = JSHC.int32mul
(/) = JSHC.int32div

*/

/*
if (JSHC.Internal === undefined)
        JSHC.Internal = {};

JSHC.Internal.PreludeXXXXXXXXX = {
  // makes thunk computations of javascript operations.
//  "+": function(a,b){return JSHC.int32add(JSHC.TR(a),JSHC.TR(b))},
//  "-": function(a,b){return JSHC.int32sub(JSHC.TR(a),JSHC.TR(b))},
//  "*": function(a,b){return JSHC.int32mul(JSHC.TR(a),JSHC.TR(b))},
//  "/": function(a,b){return JSHC.int32div(JSHC.TR(a),JSHC.TR(b))},
  int32add: function(a) {
    return function (b) {
        return JSHC.int32add((a instanceof JSHC.Thunk)? a.v : a,(b instanceof JSHC.Thunk)? b.v : b)
        }},
  int32sub: function(a) {
    return function (b) {
        return JSHC.int32sub((a instanceof JSHC.Thunk)? a.v : a,(b instanceof JSHC.Thunk)? b.v : b)
        }},
  int32mul: function(a) {
    return function (b) {
        return JSHC.int32mul((a instanceof JSHC.Thunk)? a.v : a,(b instanceof JSHC.Thunk)? b.v : b)
        }},
  int32div: function(a) {
    return function (b) {
        return JSHC.int32div((a instanceof JSHC.Thunk)? a.v : a,(b instanceof JSHC.Thunk)? b.v : b)
        }},

  int32lt: JSHC.int32comp(JSHC.int32lt),
  int32gt: JSHC.int32comp(JSHC.int32gt),
  int32le: JSHC.int32comp(JSHC.int32le),
  int32ge: JSHC.int32comp(JSHC.int32ge),
  int32eq: JSHC.int32comp(JSHC.int32eq),
  int32ne: JSHC.int32comp(JSHC.int32ne),
 }
*/

/*
JSHC.Internal.Prelude["undefined"] = JSHC.TC(function() {throw new JSHC.RuntimeError("undefined")});
*/
