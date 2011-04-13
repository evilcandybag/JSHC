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
    var ns,i,j;
    ns = {};

    // TODO: must check that declarations do not overlap.
    //       i.e for any name added to the tspace, check if it already exists.
    //       return a list of errors ?
    //       e.g if data constructors overlap between different datatypes,
    //       it must be tested for here, as it will not be found later on.

    const ts = module.body.topdecls;
    for(i=0;i<ts.length;i++){
        if( ts[i].name === "topdecl-decl" ){
            // qualify name and add to tspace
            const varname = ts[i].decl.lhs.ident;
            assert.ok( varname.loc === undefined );
            varname.loc = module.modid.id;
            ns[varname.toString(false)] = varname;
        } else if( ts[i].name === "topdecl-data" ){
            // add type constructor
            const tycon = ts[i].typ.tycon;
            assert.ok( tycon.loc === undefined );
            tycon.loc = module.modid.id;
            ns[tycon.toString(false)] = tycon;
            // add all data constructors
            for(j=0;j<ts[i].constrs.length;j++){
                const dacon = ts[i].constrs[j].dacon;
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
};

////////////////////////////////////////////////////////////////////////////////
