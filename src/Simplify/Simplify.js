
////////////////////////////////////////////////////////////////////////////////

JSHC.Simplify.simplify = function(ast){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST");
    var f = this.checkNames[ast.name];
    if( f === undefined ){
	throw new Error("no definition for "+ast.name);
    }
    assert.ok( f instanceof Function, ast.name+" <: Function." )
    f.call(this,ast);
};

JSHC.Simplify.simplify["module"] = function(ast){
    JSHC.Simplify.simplify(ast.body);
};

JSHC.Simplify.simplify["body"] = function(ast){
    var i;
    for(i=0;i<ast.topdecls.length;i++){
	if( ast.topdecls[i].name === "topdecl-decl" ){
	    JSHC.Simplify.simplify(ast.topdecls[i]);
	}
    }
};

JSHC.Simplify.simplify["topdecl-decl"] = function(ast){
    JSHC.Simplify.simplify(ast.decl);
};

JSHC.Simplify.simplify["decl-fun"] = function(ast){
    // take all parameters in the LHS and add as lambdas on the RHS.
    var i;
    var old_rhs = ast.rhs;

    // TODO: should remove position information recursively from ast.lhs.args.
    ast.rhs = {name:"lambda", args: ast.lhs.args, rhs: old_rhs, pos: ast.pos};}
};

////////////////////////////////////////////////////////////////////////////////
