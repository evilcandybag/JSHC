
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

//    for 
    
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
