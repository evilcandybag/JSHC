////////////////////////////////////////////////////////////////////////////////
// NAME CHECK

/*
produces errors for missing idents.

keeps track of identifiers in scope.
  must clone the namespace when introducing new variables that might shadow
  existing identifiers.
  can not just replace when shadowing, as the previous variable will disappear
  if one just removes the new one, so the old can never be used later on.

qualify all top-level names and usage of names in expressions.
only local names are not qualified.
*/

////////////////////////////////////////////////////////////////////////////////

/*
  makes a mapping from module name to module AST that contains all the already
  checked modules.
*/
JSHC.Check = function(modules, module_ast){
  this.modules = modules;
  this.module = module_ast;
  this.errors = [];  // list of errors found
};

JSHC.Check.nameCheck = function(modules,module) {
    var check;

    // create instance of Check
    check = new JSHC.Check(modules,module);

    // call checkNames on module. handles all parts of AST recursively.
    check.checkNames({},module);
    return check.errors;
};

JSHC.Check.prototype.lookupName = function(lspace, name){
    var i;
    var ns = {};  // namespace to put all referenced names into

    // TODO: if name is qualified, must check the qualification.
    //       assumes NOT qualified below.
    //       could just filter the list of possible matches at the end.

    if( lspace[name] !== undefined ) {
        return;  // local (always non-qualified) name
    }

    if( this.module.body.tspace[name] !== undefined ){
        // add top-level (currently non-qualified) name
        //ns[name] = {name: module.body.tspace[name], src: module.modid};
	ns[this.module.body.tspace[name]] = this.module.body.tspace[name];
    }

    const impdecls = this.module.body.impdecls;
    for(i=0;i<impdecls.length;i++){
        const imp = impdecls[i];
        const exports = modules[imp.modid];
        const inames = imp.imports;
	const exp = exports[name];

	// check if exported and imported accoring to the import list.
        if( exp !== undefined && isImported(exp,imp,name) ){
	    ns[exp] = exp;
	}
    }

    amount = JSHC.numberOfKeys(ns);
    if( amount === 0 ){
	// error: name not in scope
	//make sure our internal functions pass the checks
	var internal = "JSHC.Internal"
	if (name.toString().substr(0,internal.length) === internal)
	    return;
	
	this.errors.push(new JSHC.SourceError(this.module.modid,name.pos,name+" not in scope"));
    } else if( amount === 1 ){
        for (var temp in ns) {
	    // declared in one location (topdecl or import)
	    assert.ok( name.loc === undefined );
	    assert.ok( ns[temp].loc !== undefined );
	    name.loc = ns[temp].loc;
	}
    } else { // amount.length >= 2
	// error: ambiguity since more than one declaration in scope
	msg = ["Ambiguity. Names in scope: "];

	for(dn in ns){
	    msg.push(dn);
	    msg.push(", ");
	}
	msg.pop(); // remove last ", "

	this.errors.push(new JSHC.SourceError(this.module.modid,name.pos,msg.join("")));
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.isImported = function(exp,inames,name){
    if( inames === undefined ){   // importing everything
	return true;
    } else {
	var inList = isInImportList(exp,inames,name);
	if( inList && !imp.hiding ){
	    return true;
	} else if( !inList && imp.hiding ){
	    return true;
	}
	return false;
    }
};

/*
  check if a name is in the import list of an import declaration.
 */
JSHC.Check.isInImportList = function(exp,inames,name){
    var j;

    for(j=0;j<inames.length;j++){
	if( inames[j].name === "import-var" ){
	    return inames[j].varname.equal(name);
	} else if( inames[j].name === "import-tycon" ){
	    // if importing tycon, then return it
	    if( inames[j].tycon.equal(name) ){
		return true;
	    }

	    // check if importing one if the data constructors.
	    const dacons = inames[j].list;
	    if( dacons === undefined ){
		if( inames[j].all ){
		    // all data constructors imported
		    return exp.memberOf === inames[j].tycon.id;
		} else {
		    // no data constructors imported
		    return false;
		}
	    } else {
		// some data constructors imported
		assert.ok( inames[j].all === false );

		// check if dacon is in the list.
		for(k=0;k<dacons.length;k++){
		    if( exp.equal(dacons[k]) ){
			return true;
		    }
		}
		return false;
	    }
	}
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
need a function that given a module, a local namespace, and a name to look up,
will look it up in the local namespace, the top-level namespace (stored in the
body) and by looking at the import declarations.

if the name occurs in more than one location, then then it ambiguous and an
error must be thrown, otherwise, it should return the complete name, which
would be the qualified name for imported names and top-level declarations, and
just the name itself for local names.
N:all modules have an import "import Prelude" unless explicitly importing
  from the Prelude.

this function can be used to check every use of a name in any expression.
*/

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.prototype.checkNames = function(ls,ast){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST");
    var f = this.checkNames[ast.name];
    if( f === undefined ){
	throw new Error("no definition for "+ast.name);
    }
    assert.ok( f instanceof Function, ast.name+" <: Function." )
    f.call(this,ls,ast);
};

JSHC.Check.prototype.checkNames["module"] = function(ls,ast){
    var i;

    assert.ok( this.module === ast );

    this.checkNames({}, ast.body);

    // check exports
    this.module.espace = {};  // new empty namespace for all exports

    if( ast.exports === undefined )return;
    for(i=0;i<ast.exports.length;i++){
	this.checkNames({}, ast.exports[i]);
    }
};

JSHC.Check.prototype.checkNames["export-qvar"] = function(ls,ast){
    var es = this.module.espace;
    
    this.lookupName({},ast.varname);
    if( es[ast.varname.toStringN()] !== undefined ){
        this.errors.push(new SourceError(this.module.modid, ast.varname.pos, ast.varname + " already exported."));
    }
    es[ast.varname.toStringN()] = ast.varname;
};

//TODO:
//JSHC.Check.prototype.checkNames["export-module"] = function(ls,ast){
//    var es = this.module.espace;
//    
//};

JSHC.Check.prototype.checkNames["export-type-unspec"] = function(ls,ast){
    var es = this.module.espace;
    
    this.lookupName({},ast.tycon);
    this.modules.espace[ast.tycon.toStringN()] = ast.tycon;
	
};

JSHC.Check.prototype.checkNames["export-type-all"] = function(ls,ast){
    var es = this.module.espace;
    var decl;    
        
    
    this.lookupName({},ast.exp);
    this.module.espace[ast.exp.toStringN()] = ast.exp;
    decl = JSHC.Check.lookupDatatype(this.module,ast.exp);
    for(i=0;i<decl.constrs.length;i++){
	// TODO: check if already exported
	//       refer to position of previous declaration in case
	//       of error.
	es[decl.constrs[i].dacon.toStringN()] = decl.constrs[i].dacon;
    }
};

JSHC.Check.prototype.checkNames["export-type-vars"] = function(ls,ast){
    var es = this.module.espace;

    this.lookupName({},ast.tycon);
    this.modules.espace[ast.tycon.toStringN()] = ast.tycon;
    // find the datatype declaration and add the listed members
    // produce error if not in datatype declaration.
    decl = JSHC.Check.lookupDatatype(this.module,ast.tycon);
    var dacons = {};
    for(i=0;i<decl.constrs.length;i++){
	dacons[decl.constrs[i].dacon.toStringN()] =
	    decl.constrs[i].dacon;
    }
    for(i=0;i<ast.members.length;i++){
	if( dacons[ast.members[i].toStringN()] === undefined ){
	    this.errors.push(new SourceError(this.module.modid, ast.members[i].pos, ast.members[i] + " not in datatype"));
	} else {
	    es[ast.members[i].toStringN()] = ast.members[i];
	    ast.members[i].loc = module.modid.id;
	}
    }
	
};

//Old version of export kept for reference. TODO: remove
JSHC.Check.prototype.checkNames["export"] = function(ls,ast){
    var decl,es,i;

    es = this.module.espace;

    if( ast.varname !== undefined ){
	this.lookupName({},ast.varname);
	if( es[ast.varname.toStringN()] !== undefined ){
	    this.errors.push(new SourceError(this.module.modid, ast.varname.pos, ast.varname + " already exported."));
	}
	es[ast.varname.toStringN()] = ast.varname;

    } else if( ast.modname !== undefined ){
	// TODO: exporting everything imported from a module
	// need to traverse the import declarations importing from ast.modname
	// and add every imported name (in some efficient way).

    } else if( ast.tycon !== undefined ){
	this.lookupName({},ast.tycon);
	this.modules.espace[ast.tycon.toStringN()] = ast.tycon;
	if( ast.all ){
	    decl = JSHC.Check.lookupDatatype(this.module,ast.tycon);
	    for(i=0;i<decl.constrs.length;i++){
		// TODO: check if already exported
		//       refer to position of previous declaration in case
		//       of error.
		es[decl.constrs[i].dacon.toStringN()] = decl.constrs[i].dacon;
	    }

	} else if( ast.list ){
	    // find the datatype declaration and add the listed members
	    // produce error if not in datatype declaration.
	    decl = JSHC.Check.lookupDatatype(this.module,ast.tycon);
	    var dacons = {};
	    for(i=0;i<decl.constrs.length;i++){
		dacons[decl.constrs[i].dacon.toStringN()] =
		    decl.constrs[i].dacon;
	    }
	    for(i=0;i<ast.members.length;i++){
		if( dacons[ast.members[i].toStringN()] === undefined ){
		    this.errors.push(new SourceError(this.module.modid, ast.members[i].pos, ast.members[i] + " not in datatype"));
		} else {
		    es[ast.members[i].toStringN()] = ast.members[i];
		    ast.members[i].loc = module.modid.id;
		}
	    }
	}
    } else {
	throw new JSHC.CompilerError("unknown export");
    }
};

JSHC.Check.lookupDatatype = function(module,tycon){
    var i;
//    alert("LOOKING FOR TYCON:\n" + JSHC.showAST(tycon));
    const ts = module.body.topdecls;
    for(i=0;i<ts.length;i++){
	if( ts[i].name !== "topdecl-data" || !ts[i].typ.tycon.equal(tycon) ){
	    continue;
	}
	return ts[i];
    };
    throw new JSHC.SourceError("Type not found", tycon.pos, "Module " + module.modid.toString() + " failed to export type " + tycon.id + ": not in scope.");
};

JSHC.Check.prototype.checkNames["body"] = function(ls,ast){
    var i;
    for(i=0;i<ast.impdecls.length;i++){
	this.checkNames({}, ast.impdecls[i]);
    }
    for(i=0;i<ast.topdecls.length;i++){
	this.checkNames({}, ast.topdecls[i]);
    }
};

JSHC.Check.prototype.checkNames["impdecl"] = function(ls,imp){
    var j,k,l;

    const exports = this.modules[imp.modid];
    if( exports === undefined ){
	// this should be impossible if compilation stops when parsing of any
	// module fails.
	//errors.push(new SourceError(module.modid.id, imp.pos, "imported module not available"));
	throw new JSHC.CompilerError("A module being dependent upon is missing.");
    }
    
    //if a module exports everything, that's what it does, so no need to check
    if (imp.imports === undefined)
        return;
            
    const inames = imp.imports;
    for(j=0;j<inames.length;j++){
	if( inames[j].name === "import-var" ){
	    if( exports.containsVar(inames[j].varid.id) === false ){
		this.errors.push(new SourceError(module.modid.id, inames[j].varid.pos, "variable not exported by module " + imp.modid.id));
	    }
	} else if( inames[j].name === "import-tycon" ){
	    if( exports.containsTycon(inames[j].tycon.id) === false ){
		this.errors.push(new SourceError(module.modid.id, inames[j].varid.pos, "type constructor not exported by module " + imp.modid.id));
	    } else {
		const datatype = exports.lookupTycon(inames[j].tycon.id);
		const dacons = inames[j].list;
		if( dacons !== undefined ){
		    for(k=0;k<dacons.length;k++){
			// check if exported datatype contains the data constructor
			for(l=0;l<datatype.constrs.length;l++){
			    if( datatype.constrs[l].id === dacons[k].id ){
				this.errors.push(new SourceError(module.modid.id, inames[j].varid.pos, "data constructor " + dacons[k].id + " not in datatype " + inames[j].tycon.id + " exported by module " + imp.modid.id));
			    }
			}
		    }
		}
	    }
	}
    }
};

JSHC.Check.prototype.checkNames["topdecl-data"] = function(ls,ast){
    var i,ds;

    ls = {};  // start with empty local namespace

    // add type constructor
    ls[ast.typ.tycon.toStringN()] = ast.typ.tycon;

    // add type variables
    for(i=0;i<ast.typ.vars.length;i++){
	ls[ast.typ.vars[i].toStringN()] = ast.typ.vars[i];
    }

    ds = {};  // namespace of the data constructors
    const constrs = ast.constrs;
    for(i=0;i<constrs.length;i++){
	// check that data constructor name is not already used.
	if( ds[constrs[i].dacon.toStringN()] !== undefined ){
	    this.errors.push(new SourceError(this.module.modid,constrs[i].dacon.pos,constrs[i].dacon + " already exists."));
	}
	ds[constrs[i].dacon.toStringN()] = constrs[i].dacon;
	this.checkNames(ls, constrs[i]);
    }
};

JSHC.Check.prototype.checkNames["topdecl-decl"] = function(ls,ast){
    this.checkNames({},ast.decl);
};

JSHC.Check.prototype.checkNames["constr"] = function(ls,ast){
    var i;

    const types = ast.types;
    for(i=0;i<types.length;i++){
	this.lookupName(ls,types[i]);
    }
};

JSHC.Check.prototype.checkNames["decl-fun"] = function(ls,ast){
    var i;

    ls = {};  // start with empty local namespace

    // add function name.
    ls[ast.lhs.ident] = ast.lhs.ident;

    // add parameter names.
    ps = {};  // namespace of the data constructors
    const args = ast.lhs.args;
    for(i=0;i<args.length;i++){
	// check that no parameter names are the same.
	if( ps[args[i]] !== undefined ){
	    this.errors.push(new SourceError(this.module.modid,args[i].pos,args[i] + " declared twice."));
	}
	ps[args[i]] = args[i];
	ls[args[i]] = args[i];
    }

    // check RHS.
    this.checkNames(ls,ast.rhs);
};

JSHC.Check.prototype.checkNames["case"] = function(ls,ast){
    //TODO: definition for case
    
};

JSHC.Check.prototype.checkNames["application"] = function(ls,ast){
    var i;

    const exps = ast.exps;
    for(i=0;i<exps.length;i++){
        switch (exps[i].name) {
        case "varname":
	    this.lookupName(ls,exps[i]);
	default:
	}
    }
    
};

////////////////////////////////////////////////////////////////////////////////
