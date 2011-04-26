
////////////////////////////////////////////////////////////////////////////////

DEFINE_SINGLETON("Haskell_Keymap", Ymacs_Keymap, function(D){
	D.KEYS = {
	    "C-x i" : "jshc_switch_to_interpreter",
	    "C-x a" : "auto_mode"
	};
});

////////////////////////////////////////////////////////////////////////////////

// TODO: just a copy of the markdown tokenizer to get rid of errors
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

        function foundToken(c1, c2, type) {
	    tok.onToken(stream.line, c1, c2, type);
        };

        function next() {
	    stream.checkStop();
	    var tmp;
	    if (stream.col == 0 && (tmp = stream.lookingAt(/^(#+)/))) {
		foundToken(0, stream.col = stream.lineLength(), "markdown-heading" + tmp[0].length);
	    }
	    else if (stream.line > 0 && stream.col == 0 && (tmp = stream.lookingAt(/^[=-]+$/)) && /\S/.test(stream.lineText(stream.line - 1))) {
		tmp = tmp[0].charAt(0) == "=" ? 1 : 2;
		tmp = "markdown-heading" + tmp;
		tok.onToken(stream.line - 1, 0, stream.lineLength(stream.line - 1), tmp);
		foundToken(0, stream.col = stream.lineLength(), tmp);
	    }
	    else if (stream.col == 0 && (tmp = stream.lookingAt(/^[>\s]*/))) {
		tmp = tmp[0].replace(/\s+/g, "").length;
		if (tmp > 3)
		    tmp = "";
		tmp = "markdown-blockquote" + tmp;
		foundToken(0, stream.col = stream.lineLength(), tmp);
	    }
	    else {
		foundToken(stream.col, ++stream.col, null);
	    }
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
		JSHC.Ymacs.switchToInterpreter(this.ymacs);
	    })
	    /*
	      haskell_dl_mode: Ymacs_Interactive(function() {
	      return this.cmd("haskell_mode", true);
	      })
	    */
});

////////////////////////////////////////////////////////////////////////////////
