
////////////////////////////////////////////////////////////////////////////////

// Interpreter
JSHC.Ymacs.Interpreter = function(buf, modulePrefix){
    assert.ok( buf !== undefined );
    assert.ok( modulePrefix !== undefined );
    this.history = [];    // command history
    this.compiler = new JSHC.Compiler(modulePrefix);
    this.buf = buf;
    this.prompt = JSHC.Ymacs.Interpreter.prompt;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Ymacs.Interpreter.prototype.execCommand = function(line){
    var msg = [];
    var command;
    const commands = ["?", "help", "show-path",
		      "show-code"];
    line = line.trim();
    var words = line.split(/\s/);

    if( words[0][0] === ":" ){
	command = words[0];
    } else {
	command = "";
    }

    switch( command ){
    case ":":
	// repeat previous command

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":add":
	// add modules to target set

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":browse":
	// :browse [[*]modulename]
	// show espace of module. default to last loaded module.
	// '*'  show all names in top-level scope of module.
	//      i.e union up all ispaces and the tspace, then resolve each
	//      name so that it will be qualified if ambiguous, otherwise not.

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":edit":
	// :edit modulename/URL
	// open a module (creates new buffer) from the file system or URL

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":help": case ":?":
	msg.push(commands.join("\n"));
	break;

    case ":info":
	// :info name     // give location of any name. members of tycon/tycls.
	//    tab-completion on names.

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":kind":
        // :kind name     // must be a type constructor
        for(var w=1 ; w<words.length ; w++ ){
            //alert(JSHC.showAST(JSHC.parseExp(words[w])));
        }

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":load":
        // :load modulename+   // specify new targets. reloads.
	//     default to a subset or the prelude in case of failure.
	//     sets the view set to the same as the target set.
	// :load              // target and view will be the prelude.

        this.compiler.setTargets(words.slice(1));
        //this.view = this.compiler.getTargets(); // get copy of targets
        try {
            this.compiler.recompile();
        } catch (err) {
                alert(JSHC.showError(err));
                msg.push(err);
        }
        this.compiler.errors.forEach(function(err){
		msg.push("error: "+err);
	    });

        break;

    case ":module":
	// :module [+/-] ([*]modulename)+    // modify the view set
	//   '*'      access to tspace + ispaces.
	//   non-'*'  access to espace.

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":quit":
	// :quit     // remove buffer (and frame if >1) "kill_frame" ?

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":reload":
	// :reload   // reload the targets. get a new set of loaded modules.

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":set":
	// :set       // set an interpreter variable

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":show":
	// :show
	//     bindings   // show bindings by interpreter let-statements
	//     modules    // show loaded modules
	//     path       // show URLs
	//     files      // show files in file system
	//     code       // show generated code of all loaded modules
	//                // should have a command to open code in a buffer ?

	if( words.length !== 2 ){
	    msg.push("error: invalid number of arguments for :show");
	    break;
	}
	switch( words[1] ){
	case "path":
	    msg.push(this.compiler.path.join("\n"));
	    break;
	case "code":
	    msg.push(this.compiler.getAllJSCode());
	    break;
	default:
	    msg.push("error: invalid interpreter variable");
	}
	break;

    case ":type":
	// :type          // parse and type expression. then show type.

	msg.push("error: \""+words[0]+"\" not implemented");
	break;

    case ":!":
    case ":js":
        try {
        	msg.push(eval(line.substr(3)));
        } catch (err) {
            msg.push(err);
        }
        break;
    
    case "":
	// evaluation of expressions
	// * names
	//   need to have access to all the names in top-level scope of all
	//   target modules. should perhaps give the name resolution function a
	//   set of modules in scope instead of working on one so that one can
	//   pass in a list of them and it will check the tspace and ispaces of
	//   all of them.
	// * compilation
	//   each expression must be compiled. let-statements makes
	//   declarations. for any non-let-statement, do "let it = e; print it"
	//   as in GHCi.

	// * import modulename
	//   equivalent to ":module +modulename"
        try {
            var expr = JSHC.Compiler.compileExp(line);
        	msg.push(eval(expr));
        } catch (err) {
            alert("expression:\n" + line + "\ngenerated code:\n" + expr + "\nwith error:\n\n" + JSHC.showError(err));
            msg.push(err);
        }
	break;

    default: msg.push("error: unknown command: "+command);
    }

    return msg.join("");
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Ymacs.Interpreter.prototype.autoComplete = function(){
   // TODO
   return {error: "auto-completion not implemented"};
};

////////////////////////////////////////////////////////////////////////////////

/*
  Called with a command to run. defaults to using the input on the last
  line of the buffer.
  The command will be auto-completed if possible.
  Output will be written to the buffer.
*/
JSHC.Ymacs.Interpreter.prototype.runCommand = function(opt_text){
    // NOTE: currently running commands synchronuously.
    //       should probably be done asynchronuously instead.
    
    var output, line;

    if( opt_text !== undefined ){
	// run given command

	output = this.execCommand(opt_text);

	// find position where last line begins
	var pos = this.buf.getCodeSize() - this.buf.caretMarker.getRowCol().col;

	// make sure output ends with a newline
	if( output[output.length-1] !== "\n" ){
	    output += "\n";
	}

	// insert output before last line
	this.buf.__insertText(output, pos);

    } else {
	// run command using last line

	line = this.buf.code[this.buf.code.length-1].substr(this.prompt.length);

	// store buffer text in history
	this.history.push(line);

	output = this.execCommand(line);

	// insert new line + output
	this.buf.__insertText("\n");
	this.buf.__insertText(output);
	    
	// insert new line + prompt
	this.buf.__insertText("\n");
	this.buf.__insertText(this.prompt);
	    
	// clear undo information
	this.buf.__undoQueue = [];
	this.buf.__redoQueue = [];
    }
};

////////////////////////////////////////////////////////////////////////////////

// FIXME:
// need to currently exist as a constant outside the created interpreter object
// since the interpreter-mode needs to know the prompt to color it, which
// seemingly must be written to be applied on an arbitrary buffer, not just a
// buffer that has a prompt ?
JSHC.Ymacs.Interpreter.prompt = "> ";

////////////////////////////////////////////////////////////////////////////////
