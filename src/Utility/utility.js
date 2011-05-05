
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
   for(var arg=0 ; arg<arguments.length ; arg++){
       alert(JSHC.showAST(arguments[arg]));
   };
};

////////////////////////////////////////////////////////////////////////////////
