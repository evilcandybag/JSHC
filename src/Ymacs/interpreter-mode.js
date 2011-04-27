
////////////////////////////////////////////////////////////////////////////////

DEFINE_SINGLETON("JSHC_IB_Keymap", Ymacs_Keymap, function(D){
	D.KEYS = {
	    "TAB" : "JSHC_IB_autocomplete",
	    "ENTER" : "JSHC_IB_run_command"
	    // TODO: add command history to "ARROW_DOWN" and "ARROW_UP".
	};
});

////////////////////////////////////////////////////////////////////////////////

Ymacs_Tokenizer.define("JSHC_IB", function(stream, tok) {

        var PARSER = { next: next, copy: copy };
	
        function copy() {
	    var context = restore.context = {
	    };
	    function restore() {
		return PARSER;
	    };
	    return restore;
        };

        function foundToken(c1, c2, type) {
	    tok.onToken(stream.line, c1, c2, type);
        };

        function next() {
	    stream.checkStop();
	    var tmp;

	    if (stream.col == 0 && (tmp = stream.lookingAt(JSHC.Ymacs.Interpreter.prompt))) {
		// color command prompt
		foundToken(0, stream.col = stream.lineLength(), "keyword");

	    } else if (stream.col == 0 && (tmp = stream.lookingAt("error: "))){
		// color error messages
		foundToken(0, stream.col = stream.lineLength(), "error");
	    } else {
		foundToken(stream.col, ++stream.col, null);
	    }
        };
	
        return PARSER;
});

////////////////////////////////////////////////////////////////////////////////

Ymacs_Buffer.newMode("JSHC_IB_mode", function() {
        var tok = this.tokenizer;
        this.setTokenizer(new Ymacs_Tokenizer({ buffer: this, type: "JSHC_IB" }));
	
        var keymap = JSHC_IB_Keymap();
        this.pushKeymap(keymap);
	
        return function() {
	    this.setTokenizer(tok);
	    this.popKeymap(keymap);
        };
	
});

////////////////////////////////////////////////////////////////////////////////

Ymacs_Buffer.newCommands({

	JSHC_IB_autocomplete: Ymacs_Interactive_X(function(){
		var buf = this.whenYmacs(function(ymacs){
			return ymacs.getActiveBuffer();
		    });

		const PROMPT = JSHC.Ymacs.Interpreter.prompt;

		const line = buf.code[buf.code.length-1].substr(PROMPT.length);
		var result = buf.interpreter.autoComplete(line);
		if( result.line !== undefined ){
		    buf._replaceLine(buf.code.length-1, PROMPT + result.line);
		    buf.caretMarker.setPosition(PROMPT.length + result.index);
		} else if( result.matches !== undefined ){
		    result.matches.forEach(function(match){
			    buf.__insertText(match.id,pos);
			});
		} else if( result.warning === undefined &&
			   result.error === undefined ){
		    throw new Error("bad response from interpreter auto completion");
		}
		
		// show warnings/errors regardless of line change or matches.
		if( result.error !== undefined ){
		    buf.signalError(result.error);
		} else if( result.warning !== undefined ){
		    buf.signalInfo(result.warning);
		}
	    }),

	JSHC_IB_run_command: Ymacs_Interactive_X(function(){
		this.interpreter.runCommand();
	    })
});

////////////////////////////////////////////////////////////////////////////////
