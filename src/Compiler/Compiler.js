
if( ! JSHC.Compiler )JSHC.Compiler = {};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler = function(modulePrefix){
    this.flags = {};
    this.fileSystem = {};
    this.path = [];
    if( location !== undefined && location.href !== undefined ){
	this.path.push(location.href.substr(0, location.href.lastIndexOf("/") + 1) + "hslib/");
	this.path.push(location.href.substr(0, location.href.lastIndexOf("/") + 1) + "hsusr/");
    }
    this.modulePrefix = modulePrefix;
    this.modules = {};   // mapping from module names to modules

    this.syncLoadNames = JSHC.Load.syncLoadNames;
    this.syncLoadName = JSHC.Load.syncLoadName;

    this.syncLoad = function(names){
	return this.syncLoadNames(this.fileSystem, this.path, names, this.modules);
    };

    this.errorHandlers = [];
    this.warningHandlers = [];
    this.messageHandlers = [];
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.setTargets = function(targets){
    assert.ok( targets instanceof Array );
    if( targets.length === 0 ){
	this.targets = ["Prelude"];
    } else {
	this.targets = targets;
    }
};

JSHC.Compiler.prototype.getTargets = function(){
    return this.targets;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.onError = function(err){
    this.errors++;
    for(var i=0 ; i<this.errorHandlers.length ; i++){
        this.errorHandlers[i](err);
    }
};

JSHC.Compiler.prototype.onWarning = function(warn){
    this.warnings++;
    for(var i=0 ; i<this.warningHandlers.length ; i++){
        this.warningHandlers[i](warn);
    }
};

JSHC.Compiler.prototype.onMessage = function(msg){
    this.messages++;
    for(var i=0 ; i<this.messageHandlers.length ; i++){
        this.messageHandlers[i](msg);
    }
};

JSHC.Compiler.prototype.addErrorHandler = function(onError){
    this.errorHandlers.push(onError);
};

JSHC.Compiler.prototype.addWarningHandler = function(onWarning){
    this.warningHandlers.push(onWarning);
};

JSHC.Compiler.prototype.addMessageHandler = function(onMessage){
    this.messageHandlers.push(onMessage);
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.recompile = function(){
    var mods;
    var entries = [];
    var mod,k;
    var names = this.targets;
    var errs = [];
 
    // load files
    mods = this.syncLoad(names);

    // start with empty set of checked modules
    var prev_modules = modules;
    this.modules = {};

    this.errors = [];   // clear old errors

    for(k in mods){ // mods : map
	mod = mods[k];
	if( mod.status === "success" ){
	
	    // if already loaded, and nothing has changed, then keep the old
	    // module.
	    if( mod === prev_modules[k] ){
                compiler.onMessage("not reloading "+mod.name);
	        this.modules[k] === prev_modules[k];
	    }

	    // compute/check top-level namespace and add it to AST body.
	JSHC.addToplevelNamespace.call(this, mod.ast);
        
        // calculate operator precendencies and convert to ordinary function calls
        JSHC.Fixity.fixityResolution(mod.ast);
        
	    // produce an entry in the dependency graph
	entries.push(new JSHC.Dep.Entry([mod],[mod.ast.modid.id],mod.deps()));
	
	    //document.write("success: "+mod.ast.modid.id+"<br>");
	} else if( mod.status === "failure" ){
	    this.onError("Failed to parse "+mod.name+": "+mod.err);
	} else if( mod.status === "missing" ){
	    this.onError("Failed to find "+mod.name+": "+mod.err);
	} else {
	    this.onError("Internal error: "+mod.name+": "+mod.err);
	}
    }

    if( this.errors.length > 0 ){
        return;
    }

    //traverse the graph in dependency order, and for each module group:
    var compiler = this;
    var module_group_action = function(group){
        //compiler.onMessage("checking group "+group);

        // name check: qualify imported names
        for (var i = 0; i < group.values.length; i++) {
            var module = group.values[i];

            compiler.onMessage("checking "+module.ast.modid);

            // TODO: should use compiler state to access modules/onError/onWarning
            errs = JSHC.Check.nameCheck(compiler.modules, module.ast);
            for (var i = 0; i < errs.length; i++) {
                //alert(JSHC.showError(errs[i]))
                compiler.onError("name check: "+errs[i]);
            }
        }

        // errors in the name check represents reasons for the fixity and type
        // checking to not be done (would otherwise be warnings).
        // e.g missing or ambiguous names can be warnings.
        // e.g anything that causes there to not be an espace must be an error.
        if( compiler.errors.length > 0 ){
            return;
        }
        
        // adding all modules in the group to the list of checked modules since
        // the espaces are now valid and can be used by other modules within
        // the same group.
        for (var i = 0; i < group.values.length; i++) {
            var m = group.values[i];
            compiler.modules[m.name] = m;
        }
        
        // TODO: fixity resolution should be here

        // TODO: can fixity produce errors?
        //       e.g treat precedence problems as warnings
        if( compiler.errors.length > 0 ){
            return;
        }

        // type check: add types and kinds to top-level declarations
        //JSHC.Check.typeCheck(compiler,group.values);
    };

    JSHC.Dep.check(entries,module_group_action);

    // TODO: skip code generation if errors have occured ?
    if( this.errors.length > 0 ){
        return;
    }

    // for each graph entry in arbitrary order, simplify and generate code.
    for(k in this.modules) {
        JSHC.Simplify.runSimplify(this.modules[k].ast);
    	this.modules[k].jscode = JSHC.Codegen.codegen(this.modules[k].ast, this.modulePrefix);
    }

//    alert("GENERATED CODE: \n\n" + this.getAllJSCode())
    eval(this.getAllJSCode());
};

JSHC.Compiler.prototype.checkExp = function (exp){

    this.errors = [];   // clear old errors

    var res = JSHC.parseExp(exp);
    res = {name: "decl-fun",
           ident: {name: "varname", id: "Interact+", isSymbol: false},
           args: [],
           rhs: res};
    res = {name: "topdecl-decl", decl: res};

    var impdecls = [];
    for(var modid in this.modules ){
        impdecls.push({name: "impdecl", modid: modid});
    }

    res = {name: "body", impdecls: impdecls, topdecls: [res]};

    res = {name: "module", modid: {name: "modname", id: "interact+"}, body: res};
    
    JSHC.addToplevelNamespace(res);
    JSHC.Fixity.fixityResolution(res);
    var errors = JSHC.Check.nameCheck(this.modules,res);
    for(var ix=0 ; ix<errors.length ; ix++ ){
      this.onError(errors[ix]);
    }
    JSHC.Simplify.runSimplify(res);
    return res.body.topdecls[0].decl;
};

JSHC.Compiler.compileExp = function (exp,prefix){
    var compiler = new JSHC.Compiler(prefix);
    var decl = compiler.checkExp(exp);
    return JSHC.Codegen.codegen(decl.rhs, prefix);
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.getAllJSCode = function(){
    var code = [];
    var m;

    for(m in this.modules) {
	code.push(this.modules[m].jscode);
    }

    return code.join("\n");
};

////////////////////////////////////////////////////////////////////////////////
