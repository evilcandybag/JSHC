////////////////////////////////////////////////////////////////////////////////

/*
  creates a namespace containing all top-level declarations and writes it to
  '.body.tspace' in the module AST.
  the namespace maps non-qualified names to name objects.

  qualifies all declared names with the name of the current module.

  adds information to data constructors so that one knows which type
  constructor it belongs to.
*/
JSHC.addToplevelNamespace = function(module){
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

    var ts = module.body.topdecls;
    for(i=0;i<ts.length;i++){
        if( ts[i].name === "topdecl-decl" ){
            //ignore fixity declarations
            if (ts[i].decl.name === "fixity")
                continue;
            // qualify name and add to tspace
            var varname = ts[i].decl.ident;
            assert.ok( varname.loc === undefined );
            varname.loc = module.modid.id;
            ns[varname.toString(false)] = varname;
        } else if( ts[i].name === "topdecl-data" ){
            // add type constructor
            var tycon = ts[i].typ.tycon;
            assert.ok( tycon.loc === undefined );
            tycon.loc = module.modid.id;
            ns[tycon.toString(false)] = tycon;
            // add all data constructors
            for(j=0;j<ts[i].constrs.length;j++){
                var dacon = ts[i].constrs[j].dacon;
                assert.ok( dacon.loc === undefined );
                dacon.loc = module.modid.id;
                dacon.memberOf = tycon;
                ns[dacon.toString(false)] = dacon;
            }
        } else {
            throw new JSHC.CompilerError("unknown top-level declaration");
        }
    }
    module.body.tspace = ns;
//    JSHC.alert("NS: ", ns)
    JSHC.addFixitySpace(module, ns);
//    JSHC.alert("NS2s: ", ns)
    
};

////////////////////////////////////////////////////////////////////////////////

/*
  produces a map from operator name (both id and symbol possible) to
  {fix,prec} object.
*/
JSHC.addFixitySpace = function(module_ast,ns) {
    // TODO: find operator precedences by filtering out all top-level fixity
    //       declarations and producing a map from operators to fixity.
    //       Q:is this affected by built-in syntax and if the Prelude was
    //         imported ?
    // TODO: fix to work with expressions as well. need fixity info of modules.
    assert.ok(module_ast.name === "module", "argument to Fixity.findInfo must be a module AST!");
    var decls = module_ast.body.topdecls;
    for (var d in decls) {
        if (decls[d].name === "topdecl-decl") {
            if (decls[d].decl.name === "fixity") {
                var ops = decls[d].decl.ops;
                for (var i = 0; i < ops.length; i++ ) {
                    ns[ops[i]].fixity = {fix: decls[d].decl.fix, prec: decls[d].decl.num.value};
                }
            }
        }
    }
};
