
////////////////////////////////////////////////////////////////////////////////

//JSHC.Simplify.simplify = function(ast){
//    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST");
//    var f = this.checkNames[ast.name];
//    if( f === undefined ){
//	throw new Error("no definition for "+ast.name);
//    }
//    assert.ok( f instanceof Function, ast.name+" <: Function." )
//    f.call(this,ast);
//};

JSHC.Simplify.simplify = function(ast){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST");
    var f = this.simplify[ast.name];
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
    var old_rhs = (ast.rhs.name === "infixexp")? 
                        JSHC.Simplify.reduceExp(ast.rhs) : 
                  (ast.rhs.name === "fun-where")? 
                        JSHC.Simplify.reduceWhere(ast.rhs) :
                            ast.rhs;
    
    // TODO: should remove position information recursively from ast.lhs.args.
    if(ast.lhs.args.length > 0) {
        old_rhs = {name:"lambda", args: ast.lhs.args, rhs: old_rhs, pos: ast.pos};
        ast.rhs = {name: "infixexp", exps: [old_rhs], pos: ast.pos};
        ast.lhs.args = [];
    } else {
        ast.rhs = old_rhs;
    }
};

JSHC.Simplify.simplify["infixexp"] = function(ast) {
    return JSHC.Simplify.reduceExp(ast);
};

JSHC.Simplify.simplify["fixity"] = function(ast) {
    
};

JSHC.Simplify.reduceExp = function (e) {
    if (e.name === "infixexp") {
        var exp = e.exps[0];
        switch (exp.name) {
            case "ite":
                var tru = {name: "alt", pat: new JSHC.DaCon("True", exp.e2.pos, false), 
                           exp: JSHC.Simplify.reduceExp(exp.e2)};
                var fals = {name: "alt", pat: new JSHC.DaCon("False", exp.e3.pos, false), 
                           exp: JSHC.Simplify.reduceExp(exp.e3)};            
                e.exps[0] = {name: "case", exp: JSHC.Simplify.reduceExp(exp.e1), 
                             alts: [tru,fals]};
                break;
            case "lambda":
                var rhs_new = JSHC.Simplify.reduceExp(exp.rhs)
                e.exps[0] = {name: "lambda", args: exp.args, rhs: rhs_new, pos: exp.pos};
                break;
            case "let":
                var new_exp = {name:"tuple",members: [],pos: exp.pos};
                var new_pat = {name:"tuple_pat", members: [],pos: exp.pos};
                for (var i = 0; i < exp.decls.length; i++) {
                    var temp = exp.decls[i];
                    JSHC.Simplify.simplify(temp);
                    switch (exp.decls[i].name) {
                        case "decl-fun":
                            new_exp.members.push(exp.decls[i].rhs);
                            new_pat.members.push(exp.decls[i].lhs.ident);
                            break;
                        default:
                            throw new Error("Simplify.reduceExp not defined for " + exp.decls[i].name);
                    }
                }
                new_exp = {name:"application", exps: [new_exp], pos: new_exp.pos}
                new_exp = {name:"infixexp", exps:[new_exp], pos: new_exp.pos};
                e.exps[0] = {name:"case", exp: new_exp, 
                             alts: [{name:"alt", pat: new_pat, exp: exp.exp}]};
            default:
        }
    }
    return e;
};

JSHC.Simplify.reduceWhere = function (e) {
    
    var new_exp = {name:"tuple",members: [],pos: e.decls.pos};
    var new_pat = {name:"tuple_pat", members: [],pos: e.decls.pos};
    for (var i = 0; i < e.decls.length; i++) {
        var temp = e.decls[i];
        JSHC.Simplify.simplify(temp);
        switch (temp.name) {
            case "decl-fun":
                new_exp.members.push(temp.rhs);
                new_pat.members.push(temp.lhs.ident);
                break;
            default:
                throw new Error("Simplify.reduceExp not defined for " + exp.decls[i].name);
        }
    }
    new_exp = {name:"application", exps: [new_exp], pos: new_exp.pos};
    new_exp = {name:"infixexp", exps:[new_exp], pos: new_exp.pos};
                
    var new_case = {name:"case", exp: new_exp, 
                             alts: [{name:"alt", pat: new_pat, exp: e.exp}]};

    return {name: "infixexp", exps: [new_case], pos: e.pos}
};

////////////////////////////////////////////////////////////////////////////////
