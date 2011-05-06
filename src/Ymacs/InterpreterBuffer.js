
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
	    if( modulename )ibuf.interpreter.runCommand(":load "+modulename);
	    return;
	}
    }

    // split frame, switch frame, and show interpreter in new frame
    ymacs.getActiveFrame().vsplit();
    ymacs.focusOtherFrame();
    bs.remove(ibuf);
    bs.unshift(ibuf);
    ymacs._do_switchToBuffer(ibuf);
    if( modulename )ibuf.interpreter.runCommand(":load "+modulename);
    return;
};

////////////////////////////////////////////////////////////////////////////////

// create new interpreter
JSHC.Ymacs.makeNewInterpreterBuffer = function(ymacs){

    var PROMPT = JSHC.Ymacs.Interpreter.prompt;

    // create a standard buffer. it is modified below.
    var buf = ymacs.createBuffer({ name: "jshc-interpreter" });

    buf.JSHC_commandHistory = [];
    buf.JSHC_commandHistoryPos = -1;

    // write prompt for first line
    buf.cmd("insert", "JSHC interpreter\n"+PROMPT);

    // only allow deletion of selections on the last line
    var old_delete = buf.deleteTransientRegion;
    buf.deleteTransientRegion = function(){
	if( ! this.transientMarker )return;

	var cm = this.caretMarker.getRowCol();
	var tm = this.transientMarker.getRowCol();
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
    var old_deleteText = buf._deleteText;
    buf._deleteText = function(text,pos){
	var cm = this.caretMarker.getRowCol();
	if( cm.row === this.code.length-1 &&
	    cm.col > PROMPT.length ){
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
    buf.interpreter = new JSHC.Ymacs.Interpreter(buf,"JSHC.modules");

    buf.cmd("JSHC_IB_mode");
    return buf;
};

// create the prefix used above
if( JSHC.modules === undefined )JSHC.modules = {};

////////////////////////////////////////////////////////////////////////////////
