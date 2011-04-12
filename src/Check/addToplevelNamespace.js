////////////////////////////////////////////////////////////////////////////////

/*
  creates a namespace containing all top-level declarations and writes it to
  '.body.tspace' in the module AST.
 */
JSHC.addToplevelNamespace = function(module_ast){
    // compute top-level namespace
    var tspace = JSHC.computeToplevelNames(topdecls);

    // save the top-level namespace in the body so that it can be used to
    // lookup names in the name check, etc..
    module_ast.body.tspace = tspace;
};

////////////////////////////////////////////////////////////////////////////////

/*
  given a list of top-level declarations, returns a namespace containing all
  top-level names.
*/
JSHC.computeToplevelNames = function(ts){
    var ns,i,j;
    ns = new JSHC.Namespace();
    // builds up a top-level namespace with all names that should be available
    // to all top-level declarations.
    for(i=0;i<ts.length;i++){
        if( ts[i].name === "topdecl-decl" ){
            ns.addName(JSHC.var_id, ts[i].decl.lhs.ident.id, "");
        } else if( ts[i].name === "topdecl-data" ){
            // add type constructor
            ns.addName(JSHC.tycon_id, ts[i].typ.tycon.id, "");
            // add all data constructors
            for(j=0;j<ts[i].constrs.length;j++){
                ns.addName(JSHC.dacon_id, ts[i].constrs[j].dacon.id, "");
            }
        } else {
            throw new JSHC.CompilerError("unknown top-level declaration");
        }
    }
    return ns;
};

////////////////////////////////////////////////////////////////////////////////
