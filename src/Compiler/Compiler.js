
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

JSHC.Compiler.prototype.setFileSystem = function(fileSystem){
    assert.ok( fileSystem !== undefined );
    this.fileSystem = fileSystem;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.onError = function(err){
    this.errors++;

    if( this.errorHandlers.length == 0 ){
        this.errorList.push(err);
    } else {
        for(var i=0 ; i<this.errorHandlers.length ; i++){
            this.errorHandlers[i](err);
        }
    }
};

JSHC.Compiler.prototype.onWarning = function(warn){
    this.warnings++;

    if( this.warningHandlers.length == 0 ){
        this.warningList.push(err);
    } else {
        for(var i=0 ; i<this.warningHandlers.length ; i++){
            this.warningHandlers[i](warn);
        }
    }
};

JSHC.Compiler.prototype.onMessage = function(msg){
    this.messages++;

    if( this.messageHandlers.length == 0 ){
        this.messageList.push(err);
    } else {
        for(var i=0 ; i<this.messageHandlers.length ; i++){
            this.messageHandlers[i](msg);
        }
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

    this.errors = 0;   // clear old errors
    this.warnings = 0;
    this.messages = 0;
    this.errorList = [];
    this.warningList = [];
    this.messageList = [];

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
        compiler.onMessage("checking group "+group);

        // export check hack to solve cycles
        for (var i = 0; i < group.values.length; i++) {
            var ast = group.values[i].ast;

            // no export specification, so export all top-level declarations
            if( ast.exports === undefined ){
                ast.espace = {};  // new empty namespace for all exports
                for(var name in ast.body.tspace){
                    ast.espace[name] = ast.body.tspace[name];
                }
                compiler.modules[ast.modid] = group.values[i];
            }
        }

        // name check: qualify imported names
        for (var i = 0; i < group.values.length; i++) {
            var module = group.values[i];

            compiler.onMessage("checking "+module.ast.modid);
            JSHC.Fixity.fixityResolution(module.ast);
            JSHC.Check.nameCheck(compiler, module.ast);
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
        var asts = [];
        group.values.forEach(function(mod){asts.push(mod.ast);});
        JSHC.Check.typeCheck(compiler,asts);
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

    eval("delete "+this.modulePrefix);
    eval(this.modulePrefix+" = {};");
    eval(this.getAllJSCode());
};

JSHC.Compiler.prototype.checkExp = function (exp){

    this.errors = 0;   // clear old errors
    this.errorList = [];

    var res = JSHC.parseExp(exp);
//    JSHC.alert("Parsed expr: ", res)
    res = {name: "decl-fun",
           ident: {name: "varname", id: "Interact+", isSymbol: false},
           args: [],
           rhs: res};
    res = {name: "topdecl-decl", decl: res};

    var impdecls = [];
    for(var modname in this.modules ){
        impdecls.push({name: "impdecl", modid: this.modules[modname].ast.modid});
    }

    res = {name: "body", impdecls: impdecls, topdecls: [res]};

    res = {name: "module", modid: {name: "modname", id: "interact+"}, body: res};
    
    JSHC.addToplevelNamespace(res);
    JSHC.Fixity.fixityResolution(res);
    JSHC.Check.nameCheck(this,res);
    JSHC.Check.typeCheck(this,[res]);
    JSHC.Simplify.runSimplify(res);
    return res.body.topdecls[0].decl;
};

JSHC.Compiler.compileExp = function (exp,prefix,fileSystem){
    var compiler = new JSHC.Compiler(prefix);
    
    if (fileSystem !== undefined)
        compiler.setFileSystem(fileSystem);
    
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
