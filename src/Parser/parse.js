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
    parser.lexer = new iterL();
    parser.yy.parseError = function (str, hash) {
        if (!parser.yy.lexer.parseError()) {
            throw new JSHC.ParseError(str + " expected: " + hash.expected +
                                 "<br>Lexer returned: " + parser.yy.lexer.recent,
                                  parser.yy.lexer.yylloc);
        } 
    }
    var res = parser.parse(y);
    return res;
}

