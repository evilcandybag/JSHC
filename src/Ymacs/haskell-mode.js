
////////////////////////////////////////////////////////////////////////////////

DEFINE_SINGLETON("Haskell_Keymap", Ymacs_Keymap, function(D){
	D.KEYS = {
	    "C-x i" : "jshc_switch_to_interpreter"
	    // TODO: add command to compile and place generated code in a
	    //       buffer with corressponding ".js" name.
	};
});

////////////////////////////////////////////////////////////////////////////////

Ymacs_Tokenizer.define("haskell", function(stream, tok) {

        var PARSER = { next: next, copy: copy };
	
        function copy() {
	    var context = restore.context = {
	    };
	    function restore() {
		return PARSER;
	    };
	    return restore;
        };

        function next() {
	    // TODO: color keywords, etc..
	    stream.checkStop();
	    tok.onToken(stream.line, stream.col, ++stream.col, null);
        };
	
        return PARSER;
});

////////////////////////////////////////////////////////////////////////////////

Ymacs_Buffer.newMode("haskell_mode", function() {
        var tok = this.tokenizer;
        this.setTokenizer(new Ymacs_Tokenizer({ buffer: this, type: "haskell" }));
	
        var keymap = Haskell_Keymap();
        this.pushKeymap(keymap);
	
        return function() {
	    this.setTokenizer(tok);
	    this.popKeymap(keymap);
        };
	
});

////////////////////////////////////////////////////////////////////////////////

Ymacs_Buffer.newCommands({
	
	jshc_switch_to_interpreter: Ymacs_Interactive_X(function(){
		JSHC.Ymacs.switchToInterpreter(this);
	    })
});

////////////////////////////////////////////////////////////////////////////////
