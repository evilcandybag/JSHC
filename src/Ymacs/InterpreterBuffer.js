
if( JSHC.Ymacs === undefined )JSHC.Ymacs = {};

////////////////////////////////////////////////////////////////////////////////

// Interpreter Buffer
JSHC.Ymacs.IB = {};
JSHC.Ymacs.IB.prompt = "> ";

////////////////////////////////////////////////////////////////////////////////

// create interpreter buffer (if missing) and switch to it
JSHC.Ymacs.switchToInterpreter = function(ymacs){
    const bs = ymacs.buffers;
    var ibuf = null;
    var i;

    // TODO:
    // if current frame does not contain a haskell file, then fail ?
    // 'this.getActiveFrame().buffer.name' ends with ".hs" ?
    // load haskell file ?

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

    // if shown in a frame, then change focus to that frame
    for(i=0 ; i<ymacs.frames.length ; i++ ){
	if( ymacs.frames[i].buffer === ibuf ){
	    // switch to a frame already showing the interpreter buffer
	    ymacs.setActiveFrame(ymacs.frames[i]);
	    return;
	}
    }

    // split frame, switch frame, and show interpreter in new frame
    ymacs.getActiveFrame().vsplit();
    ymacs.focusOtherFrame();
    bs.remove(ibuf);
    bs.unshift(ibuf);
    ymacs._do_switchToBuffer(ibuf);
    return;
};

////////////////////////////////////////////////////////////////////////////////

// create new interpreter
JSHC.Ymacs.makeNewInterpreterBuffer = function(ymacs){

    const PROMPT = JSHC.Ymacs.IB.prompt;

    // create a standard buffer. it is modified below.
    var buf = ymacs.createBuffer({ name: "jshc-interpreter" });

    buf.JSHC_commandHistory = [];
    buf.JSHC_commandHistoryPos = -1;

    // write prompt for first line
    buf.cmd("insert", "JSHC interpreter\n"+PROMPT);

    // only allow deletion of selections on the last line
    const old_delete = buf.deleteTransientRegion;
    buf.deleteTransientRegion = function(){
	if( ! this.transientMarker )return;

	const cm = this.caretMarker.getRowCol();
	const tm = this.transientMarker.getRowCol();
	if( this.code.length-1 === cm.row &&
	    this.code.length-1 === tm.row ){
	    if( cm.col < PROMPT.length ) {
		this.caretMarker.setPosition(this.caretMarker.getPosition()+PROMPT.length-cm.col);
	    }
	    if( tm.col < PROMPT.length ) {
		this.transientMarker.setPosition(this.transientMarker.getPosition()+PROMPT.length-tm.col);
	    }
	    old_delete.call(this);
	} else {
	    this.clearTransientMark();
	}
    }

    // only allow deletion of text if deleting at the last line after the prompt
    const old_deleteText = buf._deleteText;
    buf._deleteText = function(text,pos){
	const cm = this.caretMarker.getRowCol();
	if( cm.row === this.code.length-1 &&
	    cm.col > PROMPT.length ){
	    old_deleteText.call(this,text,pos);
	}
    };

    // insert all text at end of buffer, and run commands when writing newline
    buf.__insertText = buf._insertText;
    buf._insertText = function(text,pos){
	if( text.length === 0 )return;

	// move to end of buffer whenever text is inserted
	this.caretMarker.setPosition(this.getCodeSize());
	//this.cmd("end_of_buffer");

	if( text === "\n" ){
	    const line = this.code[this.code.length-1].substr(PROMPT.length);

	    this.JSHC_commandHistory.push(line);

	    // NOTE: currently running commands synchronuously.
	    //       should probably be done asynchronuously instead.
	    const output = JSHC.Ymacs.interpreter.onInputLine(line);

	    // insert new line + output
	    this.__insertText(text,pos);
	    this.__insertText(output,pos);
	    
	    // insert new line + prompt
	    this.__insertText(text,pos);
	    this.__insertText(PROMPT,pos);
	    
	    // clear undo information
	    this.__undoQueue = [];
	    this.__redoQueue = [];
	} else {
	    // insert user text
	    this.__insertText(text,pos);
	}
    };

    buf.cmd("JSHC_IB_mode");
    return buf;
};

////////////////////////////////////////////////////////////////////////////////
