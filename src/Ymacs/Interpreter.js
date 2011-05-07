
////////////////////////////////////////////////////////////////////////////////

// Interpreter
JSHC.Ymacs.Interpreter = function(buf, modulePrefix){
    assert.ok( buf !== undefined );
    assert.ok( modulePrefix !== undefined );
    this.history = [];    // command history
    this.compiler = new JSHC.Compiler(modulePrefix);

    // make compiler messages be added to the interpreter messages
    var interpreter = this;
    var onError = function(err){
        interpreter.addError(err);
    };
    var onWarning = function(warn){
        interpreter.addWarning(warn);
    };
    var onMessage = function(msg){
        interpreter.addMessage(msg);
    };
    this.compiler.addErrorHandler(onError);
    this.compiler.addWarningHandler(onWarning);
    this.compiler.addMessageHandler(onMessage);

    this.buf = buf;
    this.prompt = JSHC.Ymacs.Interpreter.prompt;
    this.prefix = modulePrefix;
    this.msgs;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Ymacs.Interpreter.prototype.execCommand = function(line){
    var command;
    var commands = ["?", "help", "show-path",
		      "show-code"];
    line = line.trim();
    var words = line.split(/\s/);

    if( words[0][0] === ":" ){
	command = words[0];
    } else {
	command = "";
    }

    this.errors = 0;
    this.msgs = [];  // clear old messages

    switch( command ){
    case ":":
	// repeat previous command

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":add":
	// add modules to target set

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":browse":
	// :browse [[*]modulename]
	// show espace of module. default to last loaded module.
	// '*'  show all names in top-level scope of module.
	//      i.e union up all ispaces and the tspace, then resolve each
	//      name so that it will be qualified if ambiguous, otherwise not.

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":edit":
	// :edit modulename/URL
	// open a module (creates new buffer) from the file system or URL

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":help": case ":?":
	this.addMessage(commands.join("\n"));
	break;

    case ":info":
	// :info name     // give location of any name. members of tycon/tycls.
	//    tab-completion on names.

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":kind":
        // :kind name     // must be a type constructor
        for(var w=1 ; w<words.length ; w++ ){
            this.commandKind(words[w]);
        }
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
        }
        break;

    case ":module":
	// :module [+/-] ([*]modulename)+    // modify the view set
	//   '*'      access to tspace + ispaces.
	//   non-'*'  access to espace.

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":quit":
	// :quit     // remove buffer (and frame if >1) "kill_frame" ?

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":reload":
	// :reload   // reload the targets. get a new set of loaded modules.

	this.addError("\""+words[0]+"\" not implemented");
	break;

    case ":set":
	// :set       // set an interpreter variable

	this.addError("\""+words[0]+"\" not implemented");
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
	    this.addError("invalid number of arguments for :show");
	    break;
	}
	switch( words[1] ){
	case "path":
	    this.addMessage(this.compiler.path.join("\n"));
	    break;
	case "code":
	    this.addMessage(this.compiler.getAllJSCode());
	    break;
	case "modules":
	    for(var loaded_module in this.compiler.modules){
	        this.addMessage(loaded_module);
	    }
	    break;
	default:
	    this.addError("invalid interpreter variable");
	}
	break;

    case ":type":
	// :type          // parse and type expression. then show type.
	var expression = line.substr(words[0].length+1);
	var decl = this.compiler.checkExp(expression);
	if( this.errors === 0 ){
            if( decl.ident.type === undefined ){
                this.addError("type is missing");
            } else {
                this.addMessage(decl.ident.type);
            }
        }
	break;

    case ":!":
    case ":js":
        try {
            this.addMessage(eval(line.substr(3)));
        } catch (err) {
            this.addError(err);
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
            if( line.length === 0 ){
                break;
            }

            var decl = this.compiler.checkExp(line);
            if( this.errors !== 0 ){
                break;
            }

            var expr = JSHC.Codegen.codegen(decl.rhs, this.prefix);
            this.addMessage(eval(expr));
        } catch (err) {
            alert("expression:\n" + line + "\ngenerated code:\n" + expr + "\nwith error:\n\n" + JSHC.showError(err));
            this.addError(err);
        }
	break;

    default: this.addError("unknown command: "+command);
    }

    return this.msgs.join("");
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

	// find position where last line begins
	//var pos = this.buf.getCodeSize() - this.buf.caretMarker.getRowCol().col;

	this.execCommand(opt_text);

        // need to insert prompt if missing
        line = this.buf.code[this.buf.code.length-1];
        if( line !== this.prompt ){
            // this case occurs when output is written out AFTER an existing
            // prompt.
            this.buf.__insertText(this.prompt);
        } else {
            // make sure we are at the end of the buffer
            // this case occurs when output is written out BEFORE an existing
            // prompt.
            this.buf.caretMarker.setPosition(this.buf.getCodeSize());
        }
    } else {
	// run command using last line

	line = this.buf.code[this.buf.code.length-1].substr(this.prompt.length);

	// store buffer text in history
	this.history.push(line);

	this.buf.__insertText("\n");

	this.execCommand(line);

	// insert new prompt
	this.buf.__insertText(this.prompt);
	    
	// clear undo information
	this.buf.__undoQueue = [];
	this.buf.__redoQueue = [];
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Ymacs.Interpreter.prototype.addError = function(msg){
    this.errors++;
    this.outputToBuffer("Error: "+msg);
};

JSHC.Ymacs.Interpreter.prototype.addWarning = function(msg){
    this.outputToBuffer("Warning: "+msg);
};

JSHC.Ymacs.Interpreter.prototype.addMessage = function(msg){
    this.outputToBuffer(msg);
};

JSHC.Ymacs.Interpreter.prototype.outputToBuffer = function(msg){
    // make sure we are at the end of the buffer
    this.buf.caretMarker.setPosition(this.buf.getCodeSize());

    line = this.buf.code[this.buf.code.length-1];
    if( line === this.prompt ){
        // if empty prompt, insert before it.
	var pos = this.buf.getCodeSize() - this.buf.caretMarker.getRowCol().col;
	this.buf.caretMarker.setPosition(pos);
    } else if( line.length !== 0 ) {
        // if not at the beginning of a line, make a new line.
	this.buf.__insertText("\n");
    }
    
    // make sure output ends with a newline
    if( msg[msg.length-1] !== "\n" ){
        msg += "\n";
    }

    this.buf.__insertText(msg);
};

////////////////////////////////////////////////////////////////////////////////

// FIXME:
// need to currently exist as a constant outside the created interpreter object
// since the interpreter-mode needs to know the prompt to color it, which
// seemingly must be written to be applied on an arbitrary buffer, not just a
// buffer that has a prompt ?
JSHC.Ymacs.Interpreter.prompt = "> ";

////////////////////////////////////////////////////////////////////////////////
// functions to handle commands

JSHC.Ymacs.Interpreter.prototype.commandKind = function(qname){

    var ast = this.lookupName(qname);
    if( ast !== undefined ){
        if( ast.kind === undefined ){
            this.addError("kind is missing for \""+ast+"\"");
        } else {
            this.addMessage(ast.kind);
        }
    }
};

JSHC.Ymacs.Interpreter.prototype.commandType = function(qname){

    var ast = this.lookupName(qname);
    if( ast !== undefined ){
        if( ast.type === undefined ){
            this.addError("type is missing for \""+ast+"\"");
        } else {
            this.addMessage(ast.type);
        }
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  takes a name that may be qualified and resolves it.
  if qualified, it will be searched for in the exports of that module.
  if unqualified, it will be searched for among the target modules.
  
  if not found, an error is added and 'undefined' is returned.
*/
JSHC.Ymacs.Interpreter.prototype.lookupName = function(qname){
    var dotix = qname.lastIndexOf(".");
    var name;

    if( dotix === -1 ){
       name = qname;  // not qualified
       var asts = [];
       var roots = this.compiler.getTargets();
       for(var ix=0 ; ix<roots.length ; ix++){
           var ast = this.compiler.modules[roots[ix]].ast.espace[name];
           if( ast === undefined )continue;
           asts.push(ast);
       }
       switch( asts.length ){
       case 0:
           this.addError("\""+qname+"\" not in scope");
           break;
       case 1:
           return asts[0];
           break;
       default:
           var msg = ["\""+qname+"\" is ambiguous, and may refer to "];
           for(var ix=0 ; ix<asts.length ; ix++){
               msg.push(asts[ix].toStringQ());
               msg.push(", ");
           }
           msg.pop();
           this.addError(msg.join(""));
       }
    } else {
        var name = qname.substr(dotix+1);
        var loc = qname.substr(0,dotix);
        var module = this.compiler.modules[loc];
        if( module === undefined ){
           this.addError("module "+loc+" is not loaded");
        } else {
            var ast = module.ast.espace[name];
            if( ast === undefined ){
               this.addError(loc+" does not export "+name);
            } else {
                return ast;
            }
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
