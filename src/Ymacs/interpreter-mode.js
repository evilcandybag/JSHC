
////////////////////////////////////////////////////////////////////////////////

DEFINE_SINGLETON("JSHC_IB_Keymap", Ymacs_Keymap, function(D){
	D.KEYS = {
	    "TAB" : "JSHC_IB_autocomplete"
	    // TODO: add command history to "ARROW_DOWN" and "ARROW_UP".
	};
});

////////////////////////////////////////////////////////////////////////////////

// TODO: just a copy of the markdown tokenizer to get rid of errors
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

		const line = buf.code[buf.code.length-1].substr(buf.prompt.length);
		var result = JSHC.Ymacs.interpreter.autoComplete(line);
		if( result.line !== undefined ){
		    buf._replaceLine(buf.code.length-1, buf.prompt + result.line);
		    buf.caretMarker.setPosition(buf.prompt.length + result.index);
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
	    })
});

////////////////////////////////////////////////////////////////////////////////
