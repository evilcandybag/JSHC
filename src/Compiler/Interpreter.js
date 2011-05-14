
////////////////////////////////////////////////////////////////////////////////

// Interpreter
JSHC.Interpreter = function(modulePrefix){
    assert.ok( modulePrefix !== undefined );
    this.history = [];    // command history
    this.compiler = new JSHC.Compiler(modulePrefix);

    // make compiler messages be added to the interpreter messages
    var interpreter = this;
    var errorHandler = function(err){
        interpreter.onError(err);
    };
    var warningHandler = function(warn){
        interpreter.onWarning(warn);
    };
    var messageHandler = function(msg){
        interpreter.onMessage(msg);
    };
    this.compiler.addErrorHandler(errorHandler);
    this.compiler.addWarningHandler(warningHandler);
    this.compiler.addMessageHandler(messageHandler);

    this.prefix = modulePrefix;

    this.errors = 0;
    this.warnings = 0;
    this.messages = 0;
    this.errorList = [];
    this.warningList = [];
    this.messageList = [];

    this.errorHandlers = [];
    this.warningHandlers = [];
    this.messageHandlers = [];
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Interpreter.commands =
  [":help", ":kind", ":load", ":show", ":type", ":js",
   ":show path", ":show code", ":show modules"];

JSHC.Interpreter.prototype.execCommand = function(line){
    var command;
    line = line.trim();
    var words = line.split(/\s/);

    if( words[0][0] === ":" ){
	command = words[0];
    } else {
	command = "";
    }

    // clear old messages
    this.errors = 0;
    this.warnings = 0;
    this.messages = 0;
    this.errorList = [];
    this.warningList = [];
    this.messageList = [];

    switch( command ){
    case ":":
	// repeat previous command

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":add":
	// add modules to target set

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":browse":
	// :browse [[*]modulename]
	// show espace of module. default to last loaded module.
	// '*'  show all names in top-level scope of module.
	//      i.e union up all ispaces and the tspace, then resolve each
	//      name so that it will be qualified if ambiguous, otherwise not.

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":edit":
	// :edit modulename/URL
	// open a module (creates new buffer) from the file system or URL

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":help": case ":?":
	this.onMessage(JSHC.Interpreter.commands.join("\n"));
	break;

    case ":info":
	// :info name     // give location of any name. members of tycon/tycls.
	//    tab-completion on names.

	this.onError("\""+words[0]+"\" not implemented");
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
            JSHC.alert("Compiler exception:\n",JSHC.showError(err));
        }
        break;

    case ":module":
	// :module [+/-] ([*]modulename)+    // modify the view set
	//   '*'      access to tspace + ispaces.
	//   non-'*'  access to espace.

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":quit":
	// :quit     // remove buffer (and frame if >1) "kill_frame" ?

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":reload":
	// :reload   // reload the targets. get a new set of loaded modules.

	this.onError("\""+words[0]+"\" not implemented");
	break;

    case ":set":
	// :set       // set an interpreter variable

	this.onError("\""+words[0]+"\" not implemented");
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
	    this.onError("invalid number of arguments for :show");
	    break;
	}
	switch( words[1] ){
	case "path":
	    this.onMessage(this.compiler.path.join("\n"));
	    break;
	case "code":
	    this.onMessage(this.compiler.getAllJSCode());
	    break;
	case "modules":
	    for(var loaded_module in this.compiler.modules){
	        this.onMessage(loaded_module);
	    }
	    break;
	default:
	    this.onError("invalid interpreter variable");
	}
	break;

    case ":type":
	// :type          // parse and type expression. then show type.
	var expression = line.substr(words[0].length+1);
	var decl = this.compiler.checkExp(expression);
	if( this.errors === 0 ){
            if( decl.ident.type === undefined ){
                this.onError("type is missing");
            } else {
                this.onMessage(decl.ident.type.toString());
            }
        }
	break;

    case ":!":
    case ":js":
        try {
            this.onMessage(eval(line.substr(3)));
        } catch (err) {
            this.onError(err);
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
            this.onMessage(eval(expr).toString());
        } catch (err) {
            alert("expression:\n" + line + "\ngenerated code:\n" + expr + "\nwith error:\n\n" + JSHC.showError(err));
            this.onError(err);
        }
	break;

    default: this.onError("unknown command: "+command);
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Interpreter.prototype.autoComplete = function(partial_command){
    var results = [];
    for(var ix=0 ; ix<JSHC.Interpreter.commands.length ; ix++){
        var cmd = JSHC.Interpreter.commands[ix];
        if( cmd.substr(0,partial_command.length) == partial_command ){
            results.push(cmd);
        }
    }

    if( results.length === 0 ){
        return {error: "auto-completion: no match"};
    } else if( results.length === 1 ){
        return {line: results[0].substr(partial_command.length)};
    } else {
        return {matches: results};
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Interpreter.prototype.onError = function(err){
    this.errors++;

    if( this.errorHandlers.length == 0 ){
        this.errorList.push(err);
    } else {
        for(var i=0 ; i<this.errorHandlers.length ; i++){
            this.errorHandlers[i](err);
        }
    }
};

JSHC.Interpreter.prototype.onWarning = function(warn){
    this.warnings++;

    if( this.warningHandlers.length == 0 ){
        this.warningList.push(warn);
    } else {
        for(var i=0 ; i<this.warningHandlers.length ; i++){
            this.warningHandlers[i](warn);
        }
    }
};

JSHC.Interpreter.prototype.onMessage = function(msg){
    this.messages++;

    if( this.messageHandlers.length == 0 ){
        this.messageList.push(msg);
    } else {
        for(var i=0 ; i<this.messageHandlers.length ; i++){
            this.messageHandlers[i](msg);
        }
    }
};

JSHC.Interpreter.prototype.addErrorHandler = function(onError){
    this.errorHandlers.push(onError);
};

JSHC.Interpreter.prototype.addWarningHandler = function(onWarning){
    this.warningHandlers.push(onWarning);
};

JSHC.Interpreter.prototype.addMessageHandler = function(onMessage){
    this.messageHandlers.push(onMessage);
};

////////////////////////////////////////////////////////////////////////////////
// functions to handle commands

JSHC.Interpreter.prototype.commandKind = function(qname){

    var ast = this.lookupName(qname);
    if( ast !== undefined ){
        if( ast.kind === undefined ){
            this.onError("kind is missing for \""+ast+"\"");
        } else {
            this.onMessage(ast.kind.toString());
        }
    }
};

JSHC.Interpreter.prototype.commandType = function(qname){

    var ast = this.lookupName(qname);
    if( ast !== undefined ){
        if( ast.type === undefined ){
            this.onError("type is missing for \""+ast+"\"");
        } else {
            this.onMessage(ast.type.toString());
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
JSHC.Interpreter.prototype.lookupName = function(qname){
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
           this.onError("\""+qname+"\" not in scope");
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
           this.onError(msg.join(""));
       }
    } else {
        var name = qname.substr(dotix+1);
        var loc = qname.substr(0,dotix);
        var module = this.compiler.modules[loc];
        if( module === undefined ){
           this.onError("module "+loc+" is not loaded");
        } else {
            var ast = module.ast.espace[name];
            if( ast === undefined ){
               this.onError(loc+" does not export "+name);
            } else {
                return ast;
            }
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
