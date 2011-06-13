
if( ! JSHC.Internal )JSHC.Internal = new Object();
if( ! JSHC.Internal.Prelude )JSHC.Internal.Prelude = new Object();
if( ! JSHC.Internal.Types )JSHC.Internal.Types = new Object();
// primtive operations for use in the Prelude.

////////////////////////////////////////////////////////////////////////////////

/*
    the optional name is the name used in as-patterns
*/
JSHC.Internal.WildPat = function(varname){
    assert.ok(typeof varname == "string" || varname === undefined);
    this.varname = varname;
    this.name = "WildPat";
};

JSHC.Internal.IntegerPat = function(number){
    assert.ok(typeof number == "number" );
    this.number = number;
    this.name = "IntegerPat";
};

JSHC.Internal.NamePat = function(varname){
    assert.ok(typeof varname == "string");
    this.varname = varname;
    this.name = "NamePat";
};

JSHC.Internal.ConPat = function(dacon,args){
    assert.ok(typeof dacon == "string");
    assert.ok(args instanceof Array);
    this.dacon = dacon;
    this.args = args;
    this.name = "ConPat";
};

JSHC.Internal.TuplePat = function(args){
    assert.ok(args instanceof Array);
    this.args = args;
    this.name = "TuplePat";
};

JSHC.Internal.undefined = function() {
    throw new JSHC.RuntimeError("undefined");
};

JSHC.Internal.int32maxbound = Math.pow(2,31)-1;
JSHC.Internal.int32minbound = -Math.pow(2,31);
JSHC.Internal.int16maxbound = Math.pow(2,15)-1;
JSHC.Internal.int16minbound = -Math.pow(2,15);
JSHC.Internal.int8maxbound = Math.pow(2,7)-1;
JSHC.Internal.int8minbound = -Math.pow(2,7);

// :: Int32 -> Int32 -> Int32
JSHC.Internal.int32add = function(a,b){
    var r = a + b;
    if( r > JSHC.Internal.int32maxbound || r < JSHC.Internal.int32minbound )throw new JSHC.RuntimeError("Data.Int.Int32 out of bounds in "+a+" + "+b);
    return r;
};

// :: Int32 -> Int32 -> Int32
JSHC.Internal.int32sub = function(a,b){
    var r = a - b;
    if( r > JSHC.Internal.int32maxbound || r < JSHC.Internal.int32minbound )throw new JSHC.RuntimeError("Data.Int.Int32 out of bounds in "+a+" - "+b);
    return r;
};

// :: Int32 -> Int32 -> Int32
JSHC.Internal.int32mul = function(a,b){
    var r = a * b;
    if( r > JSHC.Internal.int32maxbound || r < JSHC.Internal.int32minbound )throw new JSHC.RuntimeError("Data.Int.Int32 out of bounds in "+a+" * "+b);
    return r;
};

// :: Int32 -> Int32 -> Int32
JSHC.Internal.int32div = function(a,b){
    if( b == 0 ){
        throw new JSHC.RuntimeError("Data.Int.Int32 division by 0 in "+a+" / "+b);
    }
    var r = Math.floor(a / b);
    assert.ok(r >= JSHC.Internal.int32minbound);
    // NOTE: minbound/-1 will be out of bounds since > maxbound.
    if( r > JSHC.Internal.int32maxbound )throw new JSHC.RuntimeError("Data.Int.Int32 out of bounds in "+a+" / "+b);
    return r;
};

// :: Int32 -> Int32 -> Int32
JSHC.Internal.int32max = function(a,b){
    return Math.max(a,b);
};

JSHC.Internal.int32min = function(a,b){
    return Math.min(a,b);
};

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32eq = function(a,b){
    return a===b;
};

// :: Int32 -> Int32
JSHC.Internal.int32negate = function (a) {
    return 0 - a;
};

// :: Int32 -> Int32
JSHC.Internal.int32abs = function (a) {
    return Math.abs(a);
};

// :: Int32 -> Int32
JSHC.Internal.int32signum = function (a) {
    if( a > 0 )return 1;
    if( a < 0 )return -1;
    return 0;
};

//JSHC.Internal.int32show = function(a){
//    return new String(a);
//}

// :: String -> Int32
//JSHC.Internal.int32read = function(s){
//    return new Number(s);
//    // TOOD: must give some reasonable exception when not a number.
//}

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32lt = function (a,b) {
    return a < b;
};

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32gt = function (a,b) {
    return a > b;
};

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32le = function (a,b) {
    return a <= b;
};

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32ge = function (a,b) {
    return a >= b;
};

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32eq = function (a,b) {
    return a == b;
};

// :: Int32 -> Int32 -> Bool
JSHC.Internal.int32ne = function (a,b) {
    return a != b;
};

//JSHC.Internal.int32comp = function(fun) {
//    return (function(a) {
//    return function (b) {
//        if ( fun( (a instanceof JSHC.Thunk)? a.v : a , (b instanceof JSHC.Thunk)? b.v : b ) ) {
//            return ["True"];
//        } else {
//            return ["False"];
//        }
//    }} );
//}

JSHC.Internal.seq = function (a,b) {
    return b;
};

/*
  converts [Char] to a JavaScript String.
*/
JSHC.Internal.HSString_to_JSString = function(list){
  str="";
  var node = list.v;
  while( node.dacon !== "[]" ){
    assert.ok( node.dacon == ":" );
    assert.ok( typeof node.args[0].v == "string" );
    str += node.args[0].v;
    node = node.args[1].v;
  };
  return str;
};

////////////////////////////////////////////////////////////////////////////////

//match evaluated exp against pat
//returns: an array with any bound variables if successful, Boolean false if failed
JSHC.Internal.match = function(exp, alts) {
//    alert("match called with exp:\n\n" + JSHC.showAST(exp) + "\n\nand alts\n\n" + JSHC.showAST(alts))

    if( !(exp instanceof JSHC.Thunk) ){
        exp = new JSHC.Thunk(exp);
    }

    // array of thunks from the matching expressions
    var binds;

//    JSHC.alert("matching:", exp, "\nto:", alts);

    var match_ = function (exp, pat) {    
//    JSHC.alert("checking exp:", exp, "\nagainst pat:", pat);
        //JSHC.alert("match: before switch:\n",pat.name,"\n",pat);
        switch (pat.name) {
            case "NamePat":
                //JSHC.alert("match in case: namepat");
                binds.push(exp);
                return true;

            case "IntegerPat":
                //JSHC.alert("match in case: integer");
                return exp.v === pat.number;

            case "WildPat":
                //JSHC.alert("match in case: wildcard");
                return true;

            //case "dacon":
            //    return (pat.p[0] === exp[0] && pat.p.length === exp.length);

            case "ConPat":
                //JSHC.alert("match: conpat: evaluating the thunk");
                exp = exp.v;
                assert.ok( !( exp instanceof JSHC.Thunk) );
                
                //JSHC.alert("match conpat\n",exp);
                //if( exp.dacon == ":" ){
                //    JSHC.alert("match conpat2\n",exp.args);
                //}

                var res = exp instanceof JSHC.Internal.Datatype;
                if( res === false ){
                    //JSHC.alert("no match");
                    return res;
                }
                res = pat.dacon == exp.dacon && pat.args.length === exp.args.length;

                for (var i = 0; i < pat.args.length; i++) {
                    //if (exp[i] instanceof JSHC.Thunk)
                        res = res && match_(exp.args[i],pat.args[i]);
                    //else
                    //    res = res && match_(exp[i],pat.p[i]);
                }
                //if( res == false )JSHC.alert("no match");
                return res;

            case "TuplePat":
                exp = exp.v;
                assert.ok( !( exp instanceof JSHC.Thunk) );

                //JSHC.alert("match tuppat\n",exp);
                //if( exp.dacon == ":" ){
                //    JSHC.alert("match tuppat2\n",exp.args);
                //}

                var res = exp instanceof JSHC.Internal.Types["()"];
                if( res === false ){
                    //JSHC.alert("no match");
                    return res;
                }
                res = pat.args.length === exp.args.length;

                for (var i = 0; i < pat.args.length; i++) {
                    //if (exp[i] instanceof JSHC.Thunk)
                        res = res && match_(exp.args[i],pat.args[i]);
                    //else
                    //    res = res && match_(exp[i],pat.p[i]);
                }
                //if( res == false )JSHC.alert("no match");
                return res;

            default: 
                throw new Error("match_ needs definition for: " + pat.name);
        }
    }
//try{
    for (var i = 0; i < alts.length; i++) {
        binds = [];
        if (match_(exp, alts[i].p)) {
            assert.ok(alts[i].f instanceof Function, "rhs of pattern is not a function!");
//            alert("matched something: " + alts[i].f);
//            alert("with binds: " + binds);
            //document.write(alts[i].f);
            //JSHC.alert(binds[0]);
            //JSHC.alert(binds[1]);
            //JSHC.alert(binds[2].v);
            //JSHC.alert(typeof binds[0],typeof binds[1],typeof binds[2]);
            var f_result = alts[i].f.apply(undefined,binds);
            //JSHC.alert("got f result");
            //JSHC.alert(f_result);
            return f_result;
        }
    }
//}catch(err){JSHC.alert("unexpected error in match\n",err);}

   // throw new Error("Unhandled case in pattern match! " + JSHC.showAST(exp) + " alts:\n\n" + JSHC.showAST(alts)); //TODO: proper error reporting would be?
   throw new JSHC.RuntimeError("Unhandled case in pattern match!");  
}

////////////////////////////////////////////////////////////////////////////////

/*
  Arbitrary datatype
*/
JSHC.Internal.Datatype = function(){
};

/*
   default instance of Show for data types
*/
JSHC.Internal.Datatype.prototype.toString = function(){
    var buf = [];
    buf.push(this.dacon.toString());
    buf.push(" ");
    for(var i=0 ; i<this.args.length ; i++){
        buf.push("(");
        buf.push(this.args[i].toString());
        buf.push(")");
        buf.push(" ");
    }
    buf.pop();   // remove last space
    return buf.join("");
};

/*
  List datatype
*/
JSHC.Internal.Types["[]"] = function(dacon,args){
    assert.ok(typeof dacon == "string");
    assert.ok(args instanceof Array);
    this.dacon = dacon;
    this.args = args;
};
JSHC.Internal.Types["[]"].prototype = new JSHC.Internal.Datatype();

/*
  List toString
*/
JSHC.Internal.Types["[]"].prototype.toString = function(){
    var buf = [];
    buf.push("[");
    if( this.dacon == ":" ){
        buf.push(this.args[0].toString());
        var rest = this.args[1].v;  // evaluate the rest
        while(true){
            if( rest.dacon == "[]" ){
                break;
            }
            assert.ok( rest.dacon == ":" );
            buf.push(",");
            buf.push(rest.args[0].toString());
            rest = rest.args[1].v;  // evaluate the rest
        }
    } else if( this.dacon == "[]" ){
        // do nothing
    } else {
        throw new JSHC.RuntimeError("invalid dacon in List toString");
    }
    buf.push("]");
    return buf.join("");
};

/*
  List Cons constructor
*/
JSHC.Internal.Types["[].:"] = function(a){
    return new JSHC.Thunk(function(b){
        assert.ok( a instanceof JSHC.Thunk );
        assert.ok( b instanceof JSHC.Thunk );
        //JSHC.alert("cons:\n",a,"\n",b);
        return new JSHC.Thunk(new JSHC.Internal.Types["[]"](":",[a,b]));
    });
};

/*
  List Nil constructor
*/
JSHC.Internal.Types["[].[]"] = function(){
    return new JSHC.Internal.Types["[]"]("[]",[]);
}();

/*
  Unit/Tuple datatypes
*/
JSHC.Internal.Types["()"] = function(args){
    assert.ok(args instanceof Array);
    this.args = args;
};
JSHC.Internal.Types["()"].prototype = new JSHC.Internal.Datatype();

/*
  Unit/Tuple toString
*/
JSHC.Internal.Types["()"].prototype.toString = function(){
    var buf = [];
    buf.push("(");
    for(var i=0 ; i<this.args.length ; i++){
        buf.push(this.args[i].toString());
        buf.push(",");
    }
    buf.pop();   // remove last space
    buf.push(")");
    return buf.join("");
};

////////////////////////////////////////////////////////////////////////////////
