
if( ! JSHC.Compiler )JSHC.Compiler = {};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler = function(modulePrefix){
    this.flags = {};
    this.fileSystem = {};
    this.path = [];
    if( location !== undefined && location.href !== undefined ){
	this.path.push(location.href.substr(0, location.href.lastIndexOf("/") + 1) + "hslib/");
    }
    this.modulePrefix = modulePrefix;
    this.modules = {};   // mapping from module names to modules

    this.warnings = [];
    this.errors = [];
    this.onError = function(err){eval(this.getAllJSCode());
        this.errors.push(err);
    };
    this.onWarning = function(warn){
        this.warnings.push(warn);
    };

    this.syncLoadNames = JSHC.Load.syncLoadNames;
    this.syncLoadName = JSHC.Load.syncLoadName;

    this.syncLoad = function(names){
	return this.syncLoadNames(this.fileSystem, this.path, names, {});
    };

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

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.recompile = function(){
    var mods;
    var entries = [];
    var mod,k;
    var names = this.targets;
    var errs = [];
 
    // load files
    mods = this.syncLoad(names);

    // clear old errors
    this.errors = [];

    for(k in mods){ // mods : map
	mod = mods[k];
	if( mod.status === "success" ){

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
	return; // end because of errors.
    }

    // condense the graph of modules.
//    entries = JSHC.Dep.condense(entries);
/*
    // temporary code to avoid handling module cycles. assumes there is
    // only a single module in each entry below.
    for(k=0 ; k<entries.length ; k++){
	const entry = entries[k];
	// if there is a cycle, add an error.
	if( entry.values.length > 1 ){
	    var modnames = [];
	    entry.values.forEach(function(mod){
		    modnames.push(mod.name);
		});
	    this.onError("module cycle: "+modnames);
	}
    }
*/  

    // if there are any errors, then stop and return (errors,warnings) here.
    // errors could be: module cycles, duplicate top-level declarations,
    // etc..
    // there is no need to stop earlier than this because of errors.
    if( this.errors.length > 0 )return 0;

    this.modules = {};  // start with empty set of checked modules
    var modules = this.modules;
    var onError = this.onError;

    //traverse the graph in dependency order, and for each module group:
    var module_group_action = function(group){
        alert("checking group "+group.name);
        var module = group.values[0];

        //name check
        errs = JSHC.Check.nameCheck(modules, module.ast);
        for (var i = 0; i < errs.length; i++) {
            alert(JSHC.showError(errs[i]))
            onError(errs[i]);
        }
        //if errors, return

        //JSHC.Check.typeCheck(module.ast);
        //if errors, return

        modules[module.name] = module;
    }

    JSHC.Dep.check(entries,module_group_action);

    //alert(JSHC.showAST(this.modules));

    // for each graph entry in arbitrary order, simplify and generate code.
    for(k in this.modules) {
        JSHC.Simplify.runSimplify(this.modules[k].ast);
    	this.modules[k].jscode = JSHC.Codegen.codegen(this.modules[k].ast, this.modulePrefix);
    }

//    alert("GENERATED CODE: \n\n" + this.getAllJSCode())
    eval(this.getAllJSCode());
};


JSHC.Compiler.compileExp = function (exp,prefix){
    var res = JSHC.parseExp(exp);
    fake_lhs = {name: "fun-lhs", ident: {name: "varname", id: "Interact+", isSymbol: false}, args: []};
    res = {name: "decl-fun", lhs: fake_lhs, rhs: res};
    res = {name: "topdecl-decl", decl: res};
    res = {name: "body", impdecls: [], topdecls: [res]};
    res = {name: "module", modid: {name: "modname", id: "interact+"}, body: res};
    
    JSHC.addToplevelNamespace(res);
    JSHC.Fixity.fixityResolution(res);
    JSHC.Check.nameCheck(this.modules,res);    
    JSHC.Simplify.runSimplify(res);
    return JSHC.Codegen.codegen(res.body.topdecls[0].decl.rhs, prefix);
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
