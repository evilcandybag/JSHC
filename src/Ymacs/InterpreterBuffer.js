
////////////////////////////////////////////////////////////////////////////////

// create interpreter buffer (if missing) and switch to it
JSHC.Ymacs.switchToInterpreter = function(cbuf){
    var ymacs = cbuf.ymacs;
    var bs = ymacs.buffers;
    var ibuf = null;
    var i;
    var modulename;


    var ext = cbuf.name.substr(cbuf.name.lastIndexOf("."));

    if( ext === ".hs" ){
	modulename = cbuf.name.substr(0,cbuf.name.length-3);
    }

    // if interpreter buffer exists, then switch to it
    for(i=0 ; i<bs.length ; i++ ){
	ibuf = bs[i];
	if( ibuf.name === "jshc-interpreter" ){
	    break;
	}
	ibuf = null;
    }
    // if interpreter buffer is missing, then create it.
    if( ibuf === null ){
	ibuf = JSHC.Ymacs.makeNewInterpreterBuffer(ymacs);
    }

    // if shown in currently active frame, then do nothing.
    if( ymacs.getActiveFrame().buffer === ibuf ) {
	// interpreter is already in focus
	return;
    }
    
    //refresh the fileSystem
    for (i = 0; i < bs.length; i++) {
        if( bs[i].name.substr(cbuf.name.lastIndexOf(".")) === ".hs" ) {
            ibuf.interpreter.compiler.fileSystem[bs[i].name.substr(0,bs[i].name.length-3)] = bs[i].getCode();
        }
    }

    // if shown in a frame, then change focus to that frame
    for(i=0 ; i<ymacs.frames.length ; i++ ){
	if( ymacs.frames[i].buffer === ibuf ){
	    // switch to a frame already showing the interpreter buffer
	    ymacs.setActiveFrame(ymacs.frames[i]);
	    if( modulename )ibuf.runInterpreterCommand(":load "+modulename);
	    return;
	}
    }

    // split frame, switch frame, and show interpreter in new frame
    ymacs.getActiveFrame().vsplit();
    ymacs.focusOtherFrame();
    bs.remove(ibuf);
    bs.unshift(ibuf);
    ymacs._do_switchToBuffer(ibuf);
    if( modulename )ibuf.runInterpreterCommand(":load "+modulename);
    return;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Ymacs.interpreterPrompt = "> ";

////////////////////////////////////////////////////////////////////////////////

// create new interpreter
JSHC.Ymacs.makeNewInterpreterBuffer = function(ymacs){

    // create a standard buffer. it is modified below.
    var buf = ymacs.createBuffer({ name: "jshc-interpreter" });

    buf.PROMPT = JSHC.Ymacs.interpreterPrompt;
    buf.JSHC_commandHistory = [];
    buf.JSHC_commandHistoryPos = -1;

    buf.runInterpreterCommand = JSHC.Ymacs.runInterpreterCommand;

    // write prompt for first line
    buf.cmd("insert", "JSHC interpreter\n"+buf.PROMPT);

    // only allow deletion of selections on the last line
    var old_delete = buf.deleteTransientRegion;
    buf.deleteTransientRegion = function(){
	if( ! this.transientMarker )return;

	var cm = this.caretMarker.getRowCol();
	var tm = this.transientMarker.getRowCol();
	if( this.code.length-1 === cm.row &&
	    this.code.length-1 === tm.row ){
	    if( cm.col < buf.PROMPT.length ) {
		this.caretMarker.setPosition(this.caretMarker.getPosition()+buf.PROMPT.length-cm.col);
	    }
	    if( tm.col < buf.PROMPT.length ) {
		this.transientMarker.setPosition(this.transientMarker.getPosition()+buf.PROMPT.length-tm.col);
	    }
	    old_delete.call(this);
	} else {
	    this.clearTransientMark();
	}
    }

    // only allow deletion of text if deleting at the last line after the prompt
    var old_deleteText = buf._deleteText;
    buf._deleteText = function(text,pos){
	var cm = this.caretMarker.getRowCol();
	if( cm.row === this.code.length-1 &&
	    cm.col > buf.PROMPT.length ){
	    old_deleteText.call(this,text,pos);
	}
    };

    // insert all text at end of buffer, and run commands when writing newline
    buf.__insertText = buf._insertText;
    buf._insertText = function(text){
	if( text.length === 0 )return;

	// move to end of buffer whenever text is inserted
	this.caretMarker.setPosition(this.getCodeSize());
	//this.cmd("end_of_buffer");

	// insert user text
	this.__insertText(text);
    };

    // NOTE:
    // since there is only a single interpreter buffer, the prefix for
    // generated code can be the same.
    // if one allows several interpreter buffers, then one must create a
    // unique prefix for each buffer.
    buf.interpreter = new JSHC.Interpreter("JSHC.Ymacs.modules");
    var errorHandler = function(err){
        JSHC.Ymacs.outputToBuffer.call(buf,"Error: "+err);
    };
    var warningHandler = function(warn){
        JSHC.Ymacs.outputToBuffer.call(buf,"Warning: "+warn);
    };
    var messageHandler = function(msg){
        JSHC.Ymacs.outputToBuffer.call(buf,msg);
    };
    buf.interpreter.addErrorHandler(errorHandler);
    buf.interpreter.addWarningHandler(warningHandler);
    buf.interpreter.addMessageHandler(messageHandler);

    buf.cmd("JSHC_IB_mode");
    return buf;
};

JSHC.Ymacs.outputToBuffer = function(msg){
    // make sure we are at the end of the buffer
    this.caretMarker.setPosition(this.getCodeSize());

    line = this.code[this.code.length-1];
    if( line === this.PROMPT ){
        // if empty prompt, insert before it.
	var pos = this.getCodeSize() - this.caretMarker.getRowCol().col;
	this.caretMarker.setPosition(pos);
    } else if( line.length !== 0 ) {
        // if not at the beginning of a line, make a new line.
	this.__insertText("\n");
    }
    
    // make sure output ends with a newline
    if( msg[msg.length-1] !== "\n" ){
        msg += "\n";
    }

    this.__insertText(msg);
};

////////////////////////////////////////////////////////////////////////////////

/*
  Called with a command to run. defaults to using the input on the last
  line of the buffer.
  The command will be auto-completed if possible.
  Output will be written to the buffer.
*/
JSHC.Ymacs.runInterpreterCommand = function(opt_text){
    // NOTE: currently running commands synchronuously.
    //       should probably be done asynchronuously instead.
    
    var output, line;

    if( opt_text !== undefined ){
	// run given command

	// find position where last line begins
	//var pos = this.buf.getCodeSize() - this.buf.caretMarker.getRowCol().col;

	this.interpreter.execCommand(opt_text);

        // need to insert prompt if missing
        line = this.code[this.code.length-1];
        if( line !== this.PROMPT ){
            // this case occurs when output is written out AFTER an existing
            // prompt.
            this.__insertText(this.PROMPT);
        } else {
            // make sure we are at the end of the buffer
            // this case occurs when output is written out BEFORE an existing
            // prompt.
            this.caretMarker.setPosition(this.getCodeSize());
        }
    } else {
	// run command using last line

	line = this.code[this.code.length-1].substr(this.PROMPT.length);

	// store buffer text in history
	this.interpreter.history.push(line);

	this.__insertText("\n");

	this.interpreter.execCommand(line);

	// insert new prompt
	this.__insertText(this.PROMPT);
	    
	// clear undo information
	this.__undoQueue = [];
	this.__redoQueue = [];
    }
};

////////////////////////////////////////////////////////////////////////////////
