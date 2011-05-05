
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

JSHC.Simplify.runSimplify = function(ast) {
    JSHC.Simplify.patSimplify(ast);
//    alert("AFTER patsimplify:\n\n" + JSHC.showAST(ast))
    JSHC.Simplify.simplify(ast);
//    alert("AFTER simplify:\n\n" + JSHC.showAST(ast))
}

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

JSHC.Simplify.patSimplify = function (ast) {
//    alert("RUNNING PATSIMPLIFY on: " + ast.modid)
    var old = ast.body.topdecls;
    var newbody = [];
    var currentName = ""; 
    var temp = [];
    var toMerge = {};

    var merge = function(funs) {
    
      assert.ok(funs.length > 0, "patSimplify.merge() shouldn't be called with a list of 0 length")
      
      if (funs.length > 1) {
          var newArgs = [];
          var newAlts = [];
          var newArgsT = [];
          //calculate the new argument list
          for (var j = 0; j < funs[0].lhs.args.length; j++) {
              var vrnm = new JSHC.VarName("a" + j, funs[0].lhs.pos, false);
              newArgs.push(vrnm);
              newArgsT.push({name: "application", exps: [vrnm]});
          }
          
          newArgsT = {name: "application", exps: [{name: "tuple", members: newArgsT}]};
//          alert("newargst:\n" + JSHC.showAST(newArgsT) + "\nnewargs:\n" + JSHC.showAST(newArgs))
          //calculate the alts for the case-expression
          for (var j = 0; j < funs.length; j++) {
              var argsT = {name: "tuple_pat", members: funs[j].lhs.args}
              newAlts.push( {name: "alt", pat: argsT, exp: funs[j].rhs} );
          }
          
          //merge the different functions into one with a case-expression                  
          var newRhs = {name: "case", exp: newArgsT, alts: newAlts};
          var newLhs = {name: "fun-lhs", ident: funs[0].lhs.ident, args: newArgs};
          var res = {name: "decl-fun", lhs: newLhs, rhs: newRhs};
          res = {name: "topdecl-decl", decl: res}
          
          //push the merged function into the new body
//          alert("pushed a merged function: " + JSHC.showAST(res))
          newbody.push(res);
      } else if (funs.length === 1){
//          alert("pushed a non-merged function: " + JSHC.showAST(funs[0]))
          newbody.push({name: "topdecl-decl", decl: funs[0] });
      }
    }    
    
    for (var i = 0; i < old.length; i++) {
        if (old[i].name === "topdecl-decl" && old[i].decl.name === "decl-fun") {
            var fun = old[i].decl;

            if (toMerge[fun.lhs.ident.id] === undefined)
                toMerge[fun.lhs.ident.id] = [];
               
            toMerge[fun.lhs.ident.id].push(fun);   
        } else {
            newbody.push(old[i]);
        }

    }
    for (var k in toMerge) {
        merge(toMerge[k]);
    }
//    if (temp.length > 0)
//        merge(temp);
//    alert("NEW BODY\n\n" + JSHC.showAST(newbody));
    ast.body.topdecls = newbody;
}

////////////////////////////////////////////////////////////////////////////////
