
////////////////////////////////////////////////////////////////////////////////

var JSHC = new Object();
JSHC.Parser = new Object();
JSHC.Simplify = new Object();

modules = new Object();

////////////////////////////////////////////////////////////////////////////////

JSHC.getKeys = function(obj){
   var key,keys = [];
   for(key in obj){
      keys.push(key);
   }
   return keys;
};

JSHC.getValues = function(obj){
   var key,values = [];
   for(key in obj){
      values.push(obj[key]);
   }
   return values;
};

JSHC.showKeys = function(obj){
    var key,strs=[];
    for(k in obj){
       strs.push(k);
       strs.push("<br>");
    }
    strs.pop();
    return strs.join("");
};

JSHC.numberOfKeys = function(obj){
   var key,keys = 0;
   for(key in obj){
      keys = keys + 1;
   }
   return keys;
};

JSHC.alert = function(){
   var res = "";
   for(var arg=0 ; arg<arguments.length ; arg++){
       if (typeof arguments[arg] !== "string")
          res += "\n" + JSHC.showAST(arguments[arg]) + "\n";
       else
          res += arguments[arg];
   };
   alert(res);
};

////////////////////////////////////////////////////////////////////////////////

JSHC.deepCopy = function(obj){
    switch( typeof obj ){

    // immutable
    case "number":
    case "boolean":
    case "string":
    case "function":
        return obj;

    case "object":
        var clone = new Object;
        for(var key in obj){
            clone[key] = JSHC.deepCopy(obj[key]);
        }
        return clone;

    default:
        throw new Error("JSHC.deepCopy: missing case: "+typeof obj);
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.showPos = function(pos){
    return JSHC.showAST(pos);
};

////////////////////////////////////////////////////////////////////////////////
