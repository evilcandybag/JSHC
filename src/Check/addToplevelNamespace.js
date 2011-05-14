////////////////////////////////////////////////////////////////////////////////

/*
  creates a namespace containing all top-level declarations and writes it to
  '.body.tspace' in the module AST.
  the namespace maps non-qualified names to name objects.

  qualifies all declared names with the name of the current module.

  adds information to data constructors so that one knows which type
  constructor it belongs to.
*/
JSHC.addToplevelNamespace = function(comp, module){
    assert.ok(module !== undefined, "addToplevelNamespace: input is not a module")
    var ns,i,j;
    ns = {};

    // TODO: must check that declarations do not overlap.
    //       i.e for any name added to the tspace, check if it already exists.
    //       return a list of errors ?
    //       e.g if data constructors overlap between different datatypes,
    //       it must be tested for here, as it will not be found later on.

    // Can not give a fixity signature for an imported name.
    // must check that for each fixity declaration, the name exists in the
    // tspace in the AST body.

    module.body.spaces = {};
    var spaces = module.body.spaces;
    spaces.signature = {};
    spaces.fixity = {};

    var ts = module.body.topdecls;
    for(i=0;i<ts.length;i++){
        if( ts[i].name === "topdecl-decl" ){
            var decl = ts[i].decl;
            switch( decl.name ){
            case "fixity":
            case "type-signature":
                continue;

            case "decl-fun":
                // qualify name and add to tspace
                var varname = ts[i].decl.ident;
                assert.ok( varname.loc === undefined );
                varname.loc = module.modid.id;
                // add first occurence
                if( ns[varname.toString()] === undefined ){
                    ns[varname.toString()] = varname;
                }
            }
        } else if( ts[i].name === "topdecl-data" ){
            // add type constructor
            var tycon = ts[i].typ.tycon;
            assert.ok( tycon.loc === undefined );
            tycon.loc = module.modid.id;
            ns[tycon.toString()] = tycon;
            // add all data constructors
            for(j=0;j<ts[i].constrs.length;j++){
                var dacon = ts[i].constrs[j].dacon;
                assert.ok( dacon.loc === undefined );
                dacon.loc = module.modid.id;
                dacon.memberOf = tycon;
                ns[dacon.toString()] = dacon;
            }
        } else {
            throw new JSHC.CompilerError("unknown top-level declaration");
        }
    }
/*
    for(i=0 ; i<ts.length ; i++){
        if( ts[i].name === "topdecl-decl" ){
            var decl = ts[i].decl;
            if( decl.name == "type-signature" ){
                for (j=0; j<decl.vars.length; j++ ) {
                    var name = decl.vars[i];
                    if( ns[name] === undefined ){
                        onError("signature declaration but no definition of "+name.toStringQ());
                    } else {
                        ns[name].sig = decl.sig;
                    }
                }
            }
        }
    }
*/
    module.body.tspace = ns;

    JSHC.addFixity(comp, module, ns);
};

////////////////////////////////////////////////////////////////////////////////

/*
  produces a map from operator name (both id and symbol possible) to
  {fix,prec} object.
*/
JSHC.addFixity = function(comp,module_ast,ns) {
    assert.ok(module_ast.name === "module", "argument to Fixity.findInfo must be a module AST!");
    var decls = module_ast.body.topdecls;
    for (var d=0 ; d<decls.length ; d++) {
        if (decls[d].name === "topdecl-decl") {
            if (decls[d].decl.name === "fixity") {
                var ops = decls[d].decl.ops;
                for (var i = 0; i < ops.length; i++ ) {
                    var name = ns[ops[i]];
                    if( name === undefined ){
                        comp.onError("fixity declaration but no definition of "+ops[i].toStringQ());
                    } else {
                        ns[ops[i]].fixity = {fix: decls[d].decl.fix, prec: decls[d].decl.num.value};
                    }
                }
            }
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
