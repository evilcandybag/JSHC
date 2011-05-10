
if( JSHC.Check === undefined)JSHC.Check = {};

////////////////////////////////////////////////////////////////////////////////
// NAME CHECK

/*
produces errors for missing idents.
keeps track of identifiers in scope.
qualifies all top-level names that are used. local names are not qualified.
*/

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.nameCheck = function(comp,module) {

    // call checkNames on module. handles all parts of AST recursively.
    JSHC.Check.nameCheckModule(comp,module);
};

////////////////////////////////////////////////////////////////////////////////

/*
  Checks the possible names that the given name can refer to.
  if there is exactly one match, the name is qualified using the found name,
  and the found name is returned.
  
  comp: the compiler
  module: the current module
  lspace: either the lspace or null
  name: the name to look up
*/
JSHC.Check.lookupName = function(comp,module,lspace,name){
    assert.ok( comp !== undefined );
    assert.ok( module !== undefined );
    assert.ok( lspace !== undefined );
    assert.ok( name !== undefined );
    var i;
    var nspace = new JSHC.Set(true,"toStringQ");  // namespace to put all referenced names into
    var loc = "";

    // check if in lspace
    if( name.loc === undefined ){
        // handle unqualified name

        // if an lspace exists, then search it.
        if( lspace !== null ){
            var lname = lspace.lookup(name);
            assert.ok( lname !== null, "the lspace is not storing the value for name "+name );
            if( lname !== undefined ) {
                //JSHC.alert("found ",name," as ",lspace.lookup(name));
                nspace.add(lname);
            }
        }
    }

    // check if in tspace
    if( name.loc === undefined || name.loc === module.modid.id ){
        // handle unqualified name or qualified with the module it is within

        var name_in_tspace = module.body.tspace[name];
        if( name_in_tspace !== undefined ){
            // add top-level (currently non-qualified) name
            //ns[name] = {name: module.body.tspace[name], src: module.modid};
	    nspace.add(name_in_tspace);
        }
    }

    // check impdecls
    if( name.loc === undefined || name.loc !== module ){
        // handle unqualified name or qualified with import module name

        var impdecls = module.body.impdecls;
        for(i=0;i<impdecls.length;i++){
            var impdecl = impdecls[i];
            var exports = comp.modules[impdecl.modid].ast.espace;

            //if( module.modid.id == "interact+" ){
            //    JSHC.alert("impdecl: ",impdecl.modid.id,"\nexports: ",JSHC.showKeys(exports));
            //    JSHC.alert("found?: ",exports[name]);
            //}

            // if the name was qualified and the qualification does not match the
            // import declaration, then skip it.
            if( name.loc !== undefined && impdecl.modid.id !== name.loc ){
                continue;
            }

	    var inames = impdecl.imports;
	    var exp = exports[name];

	    // check if exported and imported accoring to the import list.
            if( exp !== undefined && JSHC.Check.isImported(exp,impdecl,name) ){
	        nspace.add(exp);
	    }
        }
    }

    amount = nspace.size();
    if( amount === 0 ){
	// error: name not in scope
	//make sure our internal functions pass the checks
	var internal = "JSHC.Internal"
	if( name.loc !== undefined && name.loc.substr(0,internal.length) === internal ){
	    return undefined;
	}
//	JSHC.alert(lspace, nameobj, nspace, module.body.tspace)
//	alert("LSPACE:\n\n"+JSHC.showAST(lspace))
//	alert("name:\n\n"+JSHC.showAST(name))
//	alert("nspace:\n\n"+JSHC.showAST(nspace))
//	alert("tspace:\n\n"+JSHC.showAST(module.body.tspace))
//	alert("LSPACE:\n\n"JSHC.showAST(lspace))
        comp.onError(new JSHC.SourceError(module.modid,name.pos,name+" not in scope"));
        JSHC.alert("failed to find: "+name);
    } else if( amount === 1 ){
        // declared in one location (topdecl or import)
        var matched_name = nspace.getAny();
        if( matched_name.loc !== undefined ){

	    // if name is not qualified and referring to a qualified name,
	    // then qualify it so that it has the same qualification.
            if( name.loc === undefined ){
	        name.loc = matched_name.loc;
	        if (name.fixity === undefined) {
	            name.fixity = matched_name.fixity;
	        }
	    }

	    return matched_name; // always return the found name when qualified
	}
    } else { // amount.length >= 2
	// error: ambiguity since more than one declaration in scope
	msg = ["Ambiguity. Names in scope: "];

	for(dn in ns){
	    msg.push(dn);
	    msg.push(", ");
	}
	msg.pop(); // remove last ", "

	comp.onE(new JSHC.SourceError(module.modid,nameobj.pos,msg.join("")));
    }
    return undefined;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.isImported = function(exp,impdecl,name){
    if( impdecl.imports === undefined ){   // importing everything
	return true;
    } else {
	var inList = JSHC.Check.isInImportList(exp,impdecl.imports,name);
	if( inList && !impdecl.hiding ){
	    return true;
	} else if( !inList && impdecl.hiding ){
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
	    var dacons = inames[j].list;
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

JSHC.Check.nameCheckModule = function(comp,ast){
    var i;

    // no export specification, so export all top-level declarations
    if( ast.espace === undefined && ast.exports === undefined ){
        ast.espace = {};  // new empty namespace for all exports
        for(var name in ast.body.tspace){
            ast.espace[name] = ast.body.tspace[name];
        }
    }

    // check imports and topdecls
    JSHC.Check.nameCheckBody(comp, ast, ast.body);

    // check export specification if it exists
    if( ast.exports !== undefined ){
        ast.espace = {};  // new empty namespace for all exports
        for(i=0;i<ast.exports.length;i++){
            JSHC.Check.nameCheckExport(comp,ast,ast.exports[i]);
        }
    }
};

JSHC.Check.nameCheckExport = function(comp,module,ast){

    switch( ast.name ){
    case "export-qvar":
    case "export-type-unspec":
        var ref = JSHC.Check.lookupName(comp,module,null,ast.exp);
        if( module.espace[ref] === undefined ){
            module.espace[ref] = ref;
        } else {
            comp.onError(new SourceError(module.modid, ast.exp.pos, ast.exp + " already exported."));
            // TODO: refer to position of previous declaration
        }
        break;

    case "export-type-all":
        var ref = JSHC.Check.lookupName(comp,module,null,ast.exp);
        module.espace[ref] = ref;

        var decl = JSHC.Check.lookupDatatype(comp,module,ast.exp);
        for(i=0;i<decl.constrs.length;i++){
            // TODO: check if already exported
            //       refer to position of previous declaration in case
            //       of error.
            var dacon = decl.constrs[i].dacon;
            module.espace[dacon] = dacon;
        }
        break;

    case "export-type-vars":
        var ref = JSHC.Check.lookupName(comp,module,null,ast.exp);
        module.espace[ref] = ref;

        // find the datatype declaration and add the listed members.
        // produce error if not in datatype declaration.
        decl = JSHC.Check.lookupDatatype(comp,module,ast.exp);
        var dacons = {};
        for(i=0;i<decl.constrs.length;i++){
            dacons[decl.constrs[i].dacon] = decl.constrs[i].dacon;
        }
        for(i=0;i<ast.vars.length;i++){
            if( dacons[ast.vars[i].toStringN()] === undefined ){
                this.errors.push(new SourceError(this.module.modid, ast.vars[i].pos, ast.vars[i] + " not in datatype"));
            } else {
                module.espace[ast.vars[i]] = ast.vars[i];
                ast.vars[i].loc = module.modid.id;
            }
        }
        break;

    default:
        throw new JSHC.CompilerError("missing export case:"+ast.name);
    }
};

JSHC.Check.lookupDatatype = function(comp,module,tycon){
    var i;
    var ts = module.body.topdecls;
    for(i=0;i<ts.length;i++){
	if( ts[i].name !== "topdecl-data" || !ts[i].typ.tycon.equal(tycon) ){
	    continue;
	}
	return ts[i];
    };
    throw new JSHC.SourceError("Type not found", tycon.pos, "Module " + module.modid.toString() + " failed to export type " + tycon.id + ": not in scope.");
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.nameCheckBody = function(comp,module,ast){
    var i;

    for(i=0 ; i<ast.impdecls.length ;){
        var id = ast.impdecls[i].modid.id;
        if( id == module.modid.id ){
            // self import
            if( id !== "Prelude" ){
                //comp.onWarning(new SourceError(imp.modid.id, imp.pos, "self imports have no effect");
            }
            // delete self import
            ast.impdecls.splice(i,1);
        } else {
            i++;
        }
    }

    // check impdecls
    for(i=0 ; i<ast.impdecls.length ; i++){
	JSHC.Check.nameCheckImpdecl(comp,module,ast.impdecls[i]);
    }

    // check topdecls
    for(i=0 ; i<ast.topdecls.length ; i++){
	JSHC.Check.nameCheckTopdecl(comp,module,ast.topdecls[i]);
    }
};


JSHC.Check.nameCheckImpdecl = function(comp,module,imp){
    var j,k,l;

    var exports = comp.modules[imp.modid];
    if( exports === undefined ){
	// this should be impossible if compilation stops when parsing of any
	// module fails.
	//errors.push(new SourceError(module.modid.id, imp.pos, "imported module not available"));
	JSHC.alert("missing module. looking for: ",imp.modid);
	for(var module in comp.modules){
	    JSHC.alert("has: ",module);
	}
	throw new JSHC.CompilerError("A module being dependent upon is missing.");
    }
    
    //if a module exports everything, that's what it does, so no need to check
    if (imp.imports === undefined)
        return;
            
    var inames = imp.imports;
    for(j=0;j<inames.length;j++){
	if( inames[j].name === "import-var" ){
	    if( exports.containsVar(inames[j].varid.id) === false ){
		comp.onError(new SourceError(module.modid.id, inames[j].varid.pos, "variable not exported by module " + imp.modid.id));
	    }
	} else if( inames[j].name === "import-tycon" ){
	    if( exports.containsTycon(inames[j].tycon.id) === false ){
		comp.onError(new SourceError(module.modid.id, inames[j].varid.pos, "type constructor not exported by module " + imp.modid.id));
	    } else {
		var datatype = exports.lookupTycon(inames[j].tycon.id);
		var dacons = inames[j].list;
		if( dacons !== undefined ){
		    for(k=0;k<dacons.length;k++){
			// check if exported datatype contains the data constructor
			for(l=0;l<datatype.constrs.length;l++){
			    if( datatype.constrs[l].id === dacons[k].id ){
				comp.onError(new SourceError(module.modid.id, inames[j].varid.pos, "data constructor " + dacons[k].id + " not in datatype " + inames[j].tycon.id + " exported by module " + imp.modid.id));
			    }
			}
		    }
		}
	    }
	}
    }
};

JSHC.Check.nameCheckTopdecl = function(comp,module,ast){
    switch( ast.name ){
    case "topdecl-data":
        JSHC.Check.nameCheckTopdeclData(comp,module,ast);
        break;
    case "topdecl-decl":
        JSHC.Check.nameCheckTopdeclDecl(comp,module,ast.decl);
        break;
    default:
        throw new JSHC.CompilerError("missing topdecl case:"+ast.name);
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.nameCheckTopdeclData = function(comp,module,ast){

    lspace = new JSHC.LSpace(true);

    lspace.withSpace(function(){

    // not adding type constructor (ast.typ.tycon) since in tspace

    // add type variables
    for(var i=0 ; i<ast.typ.vars.length ; i++){
	lspace.add(ast.typ.vars[i]);
    }

    // the check that data constructor names are not overlapping is done when
    // creating the tspace.
    for(var i=0 ; i<ast.constrs.length ; i++){
        var types = ast.constrs[i].types;
        
        // check the types given the type variables in the lspace
        for(var j=0 ; j<types.length ; j++){
            JSHC.Check.nameCheckType(comp,module,lspace,types[j]);
	}
    }

    });
};

JSHC.Check.nameCheckType = function(comp,module,lspace,ast){
    switch( ast.name ){
    case "apptype":
        JSHC.Check.nameCheckType(comp,module,lspace,ast.lhs);
        JSHC.Check.nameCheckType(comp,module,lspace,ast.rhs);
        break;

    case "tyvar":
    case "tycon":
        JSHC.Check.lookupName(comp,module,lspace,ast);
        break;

    default:
        throw new JSHC.CompilerError("missing type case:"+ast.name);
    }
};

JSHC.Check.nameCheckTopdeclDecl = function(comp,module,ast){
    switch( ast.name ){
    case "decl-fun":
        JSHC.Check.nameCheckDeclFun(comp, module, new JSHC.LSpace(true), ast);
        break;
    case "fixity":
        JSHC.Check.nameCheckFixity(comp,module,ast);
        break;
    default:
        throw new JSHC.CompilerError("missing decl case:"+ast.name);
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Check.nameCheckDeclFun = function(comp,module,lspace,ast){
    var args = ast.args;
    lspace.push(); // add space for names in patterns
    JSHC.Check.nameCheckPatterns(comp,module,lspace,args);
    JSHC.Check.nameCheckExp(comp,module,lspace,ast.rhs);
    lspace.pop();
};

//Check that fixity information is presented only of ops declared in this module.
JSHC.Check.nameCheckFixity = function (comp,module,ast) {
    var ops = ast.ops;
    var ts = module.body.tspace;
    for (var i = 0; i < ops.length; i++) {
        var def = ts[ops[i].toString()]
        if (def === undefined)
             throw new JSHC.CompilerError("operator " + ops[i].toString() + " not defined in the same module as fixity declaration");
    }
};

JSHC.Check.nameCheckPatterns = function(comp,module,lspace,patterns){
    // checks all patterns using the same set so that overlaps are detected.
    for(var i=0 ; i<patterns.length ; i++){
        JSHC.Check.nameCheckPattern(comp,module,lspace,patterns[i]);
    }
};

JSHC.Check.nameCheckPattern = function(comp,module,lspace,ast){
    switch( ast.name ) {
    case "dacon":
        JSHC.Check.lookupName(comp,module,lspace,ast);
        break;
    case "conpat":
        JSHC.Check.lookupName(comp,module,lspace,ast.con);
        for (var i = 0; i < ast.pats.length; i++) {
            JSHC.Check.nameCheckPattern(comp,module,lspace,ast.pats[i]);
        }
        break;
    case "varname":
        lspace.add(ast);
        break;
    case "integer-lit":
        break;
    case "tuple_pat":
        for (var i = 0; i < ast.members.length; i++) {
            JSHC.Check.nameCheckPattern(comp, module, lspace, ast.members[i]);
        }
        break;
    default:
        throw new JSHC.CompilerError("missing pattern case:"+ast.name);
    }
};

JSHC.Check.nameCheckExp = function(comp,module,lspace,ast){
    switch( ast.name ){
    case "infixexp":
        for (var i = 0; i < ast.exps.length; i++) {
            JSHC.Check.nameCheckExp(comp,module,lspace,ast.exps[i]);
        }
        break;
        
    case "qop":
        JSHC.Check.nameCheckExp(comp,module,lspace,ast.id);
        break;
        
    case "varname":
    case "dacon":
        JSHC.Check.lookupName(comp,module,lspace,ast);
        //JSHC.alert(ast.id," at ",ast.loc);
        break;
    
    case "application":
        for(var i=0 ; i<ast.exps.length ; i++){
            JSHC.Check.nameCheckExp(comp,module,lspace,ast.exps[i]);
        }
        break;
        
    case "tuple":
        for(var i=0 ; i<ast.members.length ; i++){
            JSHC.Check.nameCheckExp(comp,module,lspace,ast.members[i]);
        }
        break;

    case "integer-lit":
        break;

    default:
        throw new JSHC.CompilerError("missing exp case:"+ast.name + "\n" + JSHC.showAST(ast));
    }
};

////////////////////////////////////////////////////////////////////////////////
