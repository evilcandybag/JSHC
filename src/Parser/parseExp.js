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
 
JSHC.parseExp = function(input) {
    var x = JSHC.Parser.tokenize.parse(input);
    var y = JSHC.Parser.preL(x);
    JSHCparserExp.lexer = new iterL();
    JSHCparserExp.yy.parseError = function (str, hash) {
        if (!JSHCparserExp.yy.lexer.parseError()) {
            throw new JSHC.ParseError(str + " expected: " + hash.expected +
                                 "<br>Lexer returned: " + JSHCparserExp.yy.lexer.recent,
                                  JSHCparserExp.yy.lexer.yylloc);
        } 
    }
    var res = JSHCparserExp.parse(y);
    return res;
}

