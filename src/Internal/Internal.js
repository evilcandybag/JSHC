
JSHC.Internal = new Object();

// primtive operations for use in the Prelude.

// :: Int32 -> Int32 -> Int32
JSHC.int32add = function(a,b){
  return (a + b) % Math.pow(2,32);
}

// :: Int32 -> Int32 -> Int32
JSHC.int32sub = function(a,b){
  return (a - b) % Math.pow(2,32);
}

// :: Int32 -> Int32 -> Int32
JSHC.int32mul = function(a,b){
  var r = a * b;
  return r % Math.pow(2,32);
}

// :: Int32 -> Int32 -> Int32
JSHC.int32div = function(a,b){
  return Math.floor(a / b);
}

// :: Int32 -> Int32 -> Bool
JSHC.int32eq = function(a,b){
  return a===b;
}

JSHC.int32show = function(a){
  return new String(a);
}

// :: String -> Int32
JSHC.int32read = function(s){
  return new Number(s);
  // TOOD: must give some reasonable exception when not a number.
}

//match evaluated exp against pat
//returns: an array with any bound variables if successful, Boolean false if failed
JSHC.Internal.match = function(exp, alts) {
//    alert("match called with exp:\n\n" + JSHC.showAST(exp) + "\n\nand alts\n\n" + JSHC.showAST(alts))
    var binds = [];
//    JSHC.alert("matching:", exp, "\nto:", alts);
    var match_ = function (exp, pat) {    
//    JSHC.alert("checking exp:", exp, "\nagainst pat:", pat);
        switch (pat.name) {
            case "varname":
                binds.push(exp);
                return true;
                break;
            case "integer-lit":
                return exp === pat.p;
                break;
            case "dacon":
                return (pat.p[0] === exp[0] && pat.p.length === exp.length);
                break;
            case "conpat":
                var res = pat.p.length === exp.length
                var res = res && (pat.p[0] === exp[0])
                for (var i = 1; i < pat.p.length; i++) {
                    if (exp[i] instanceof JSHC.Thunk)
                        res = res && match_(exp[i].v,pat.p[i]);
                    else
                        res = res && match_(exp[i],pat.p[i]);
                }
                return res;
                break;
            case "tuple_pat":
                var res = pat.p.length === exp.length
                for (var i = 0; i < pat.p.length; i++) {
                    if (exp[i] instanceof JSHC.Thunk)
                        res = res && match_(exp[i].v,pat.p[i]);
                    else
                        res = res && match_(exp[i],pat.p[i]);
                }
                return res;
                break;
            default: 
                throw new Error("match_ needs definition for: " + pat.name);
        }
    }
    
    for (var i = 0; i < alts.length; i++) {
        var x = (exp instanceof JSHC.Thunk);
        if (x && match_(exp.v, alts[i].p)) {
            assert.ok(alts[i].f instanceof Function, "rhs of pattern is not a function!");
//            alert("matched something: " + alts[i].f);
//            alert("with binds: " + binds);
            return alts[i].f.apply(undefined,binds);
        } else if (match_(exp, alts[i].p)) {
//            alert("matched something: " + alts[i].f);
//            alert("with binds: " + binds);
            
            return alts[i].f.apply(undefined,binds);
        } else        
            binds = [];
    }
    throw new Error("Unhandled case in pattern match! " + JSHC.showAST((exp instanceof JSHC.Thunk)? exp.v : exp) ); //TODO: proper error reporting would be?
    
}

/*
instance Ord Int32 where
  compare = JSHC.int32cmp
  (<) = JSHC.int32lt
  (>=) = JSHC.int32ge
  (>) = JSHC.int32gt
  (<=) = JSHC.int32le
  max = JSHC.int32max
  min = JSHC.int32min
*/
