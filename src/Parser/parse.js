//require Parser/tokenize.js
//        Parser/preL.js
//        Parser/iterL.js
//        Parser/parser.js
         
JSHC.ParseError = function(msg,pos){
  this.msg = msg;
  this.pos = pos;
};

JSHC.ParseError.prototype.toString = function(){
  return this.msg;
};
 
JSHC.parse = function(input) {
    var x = JSHC.Parser.tokenize.parse(input);
    var y = JSHC.Parser.preL(x);
    JSHCparser.lexer = new iterL();
    JSHCparser.yy.parseError = function (str, hash) {
        if (JSHCparser.yy.lexer.debugArr !== undefined)
            console.log("parse error happened, lexer has so far returned:<br>" + JSHCparser.yy.lexer.debugArr)
        if (!JSHCparser.yy.lexer.parseError()) {
            throw new JSHC.ParseError(str + " expected: " + hash.expected +
                                 "<br>Lexer returned: " + JSHCparser.yy.lexer.recent,
                                  JSHCparser.yy.lexer.yylloc);
        } 
    }
    var res = JSHCparser.parse(y);
//    try {
//    alert(JSHC.showAST(res));
//    } catch (err) {
//        alert(JSHC.showError(err))
//    }
    return res;
}

