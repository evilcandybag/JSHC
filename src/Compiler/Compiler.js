
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
    this.onError = function(err){
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
    var entries = {};
    var mod,k;
    var names = this.targets;

    // load files
    mods = this.syncLoad(names);

    // clear old errors
    this.errors = [];

    for(k in mods){
	mod = mods[k];
	if( mod.status === "success" ){

	    // compute/check top-level namespace and add it to AST body.
	    JSHC.addToplevelNamespace.call(this, mod.ast);

	    // produce an entry in the dependency graph
	    entries[mod.ast.modid.id] =
		new JSHC.Dep.Entry([mod],[mod.ast.modid.id],mod.deps());
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
    entries = JSHC.Dep.condense(entries);

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

    // if there are any errors, then stop and return (errors,warnings) here.
    // errors could be: module cycles, duplicate top-level declarations,
    // etc..
    // there is no need to stop earlier than this because of errors.
    if( this.errors.length > 0 )return 0;

    //traverse the graph in dependency order, and for each module group:
      //name check
      //if errors, return with (errors,warnings)
      //type check
      //if errors, return with (errors,warnings)

    // for each graph entry in arbitrary order, simplify and generate code.
    for(k=0 ; k<entries.length ; k++){
    	// entries[k].values[0].jscode = JSHC.Compile.compile(entries[k].values[0].contents);
    }

};

////////////////////////////////////////////////////////////////////////////////

JSHC.Compiler.prototype.getAllJSCode = function(){
    var code = [];
    var m;

    for(m in modules){
	code.push(modules[m].jscode);
    }

    return code.join("\n");
};

////////////////////////////////////////////////////////////////////////////////
