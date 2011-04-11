
// -----------------------------------------------------------------------------

var JSHC = new Object();
JSHC.Parser = new Object();

modules = new Object();

// -----------------------------------------------------------------------------
// including javascript code

//function include(filename){
//  document.write("<script src='calculator.js'><\/script>")
//}

// -----------------------------------------------------------------------------
// debugging

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

var getValues = function(obj){
   var values = [];
   for(var key in obj){
      values.push(obj[key]);
   }
   return values;
}

