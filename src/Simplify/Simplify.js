
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
	JSHC.Simplify.ast_modid = ast.modid
//	JSHC.alert("SIMPLIFYING:\n\n", ast); 
    JSHC.Simplify.patSimplifyTop(ast);
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
    var ts = ast.topdecls;
    for(i=0;i<ts.length;i++){
        if( ts[i].name === "topdecl-data" ){
            // no simplification of data types is needed.

            //if( i !== ts.length-1 ){
            //    ts[i] = ts[ts.length-1];
            //    i--;
            //}
            //ts.pop();
        } else if( ts[i].name === "topdecl-decl" ){
	    if( ts[i].decl.name == "type-signature" ||
                // remove type-signature and fixity
	        ts[i].decl.name == "fixity" ){
                if( i !== ts.length-1 ){
                    ts[i] = ts[ts.length-1];
                    i--;
                }
                ts.pop();
	    } else {
	        JSHC.Simplify.simplify(ts[i].decl);
	    }
	}
    }
};

//JSHC.Simplify.simplify["topdecl-decl"] = function(ast){
//    JSHC.Simplify.simplify(ast.decl);
//};

JSHC.Simplify.simplify["decl-fun"] = function(ast){
    // take all parameters in the LHS and add as lambdas on the RHS.

    var i;
    var new_rhs;
    
    if (ast.rhs.name === "fun-where") {
    	//JSHC.alert("args.length", ast.args.length);
    	new_rhs = ast.rhs;
    	new_rhs.decls = JSHC.Simplify.patSimplifyDecls(new_rhs.decls);
    	for (var i = 0; i < new_rhs.decls.length; i++) {
    		JSHC.Simplify.simplify(new_rhs.decls[i]);
    	}
    	new_rhs.exp = JSHC.Simplify.reduceExp(new_rhs.exp);
    } else {
    	new_rhs = JSHC.Simplify.reduceExp(ast.rhs);
    }
    
    if(ast.args.length > 0) {
    	//JSHC.alert("making lambdas", ast, "with new_rhs:", new_rhs);
        ast.rhs = {name:"lambda", args: ast.args, rhs: new_rhs, pos: ast.pos};
        ast.args = [];
    } else {
        ast.rhs = new_rhs;
    }
};

//JSHC.Simplify.simplify["infixexp"] = function(ast) {
//    return JSHC.Simplify.reduceExp(ast);
//};

JSHC.Simplify.reduceExp = function (exp) {
//        var exp = e.exps[0];
        switch (exp.name) {
            case "ite":
                var tru = {name: "alt", pat: new JSHC.DaCon("True", exp.e2.pos, false), 
                           exp: JSHC.Simplify.reduceExp(exp.e2)};
                var fals = {name: "alt", pat: new JSHC.DaCon("False", exp.e3.pos, false), 
                           exp: JSHC.Simplify.reduceExp(exp.e3)};            
                exp = {name: "case", exp: JSHC.Simplify.reduceExp(exp.e1), 
                             alts: [tru,fals]};
                break;

            case "lambda":
                var rhs_new = JSHC.Simplify.reduceExp(exp.rhs)
                var dummy = {name: "decl-fun", args: exp.args, rhs: rhs_new};
                dummy = JSHC.Simplify.merge([dummy]);
                exp = {name: "lambda", args: dummy.args, rhs: dummy.rhs, pos: exp.pos};
                //if (JSHC.Simplify.ast_modid.toString() === "Lambda")
                //	JSHC.alert("SIMPLIFIED A LAMBDA in " + JSHC.showAST(JSHC.Simplify.ast_modid) + "!\n\n",exp); 
                break;

            case "let":
            	exp.decls = JSHC.Simplify.patSimplifyDecls(exp.decls);
            	for (var i = 0; i < exp.decls.length; i++) {
                    JSHC.Simplify.simplify(exp.decls[i]);
                }
                JSHC.Simplify.reduceExp(exp.exp);
                //new_exp = {name:"application", exps: [new_exp], pos: new_exp.pos}
                //new_exp = {name:"infixexp", exps:[new_exp], pos: new_exp.pos};
                break;

            case "conpat":
                var new_pats = [];
                for(var ix=0 ; ix<exp.pats.length ; ix++ ){
                    new_pats.push(JSHC.Simplify.reduceExp(exp.pats[ix]));
                }
                exp = {name: exp.name,
                       con: JSHC.Simplify.reduceExp(exp.con),
                       pats: new_pats};
                break;

            case "tuple_pat":
            case "tuple":
                var new_members = [];
                for(var ix=0 ; ix<exp.members.length ; ix++ ){
                    new_members.push(JSHC.Simplify.reduceExp(exp.members[ix]));
                }
                exp = {name:exp.name,members:new_members};
                break;

            case "listexp":
                var list = new JSHC.NilDaCon();
                var cons = new JSHC.ConsDaCon();
                for(var ix=exp.members.length-1 ; ix>=0 ; ix-- ){
                    list = {name:"application",exps:[cons,JSHC.Simplify.reduceExp(exp.members[ix]),list]};
                }
                exp = list;
                break;

            case "case":
                var new_exp = JSHC.Simplify.reduceExp(exp.exp);
                var new_alts = [];
                for(var ix=0 ; ix<exp.alts.length ; ix++ ){
                    new_alts.push(JSHC.Simplify.reduceExp(exp.alts[ix]));
                }
                exp = {name:"case",exp:new_exp,alts:new_alts};
                break;

            case "alt":
                exp = {name: "alt",
                       exp: JSHC.Simplify.reduceExp(exp.exp),
                       pat: JSHC.Simplify.reduceExp(exp.pat)};
                break;

            case "application":
                var new_exps = [];
                for(var ix=0 ; ix<exp.exps.length ; ix++ ){
                    new_exps.push(JSHC.Simplify.reduceExp(exp.exps[ix]));
                }
                exp = {name:"application",exps:new_exps};
                break;

            case "wildcard":
            case "varname":
            case "dacon":
            case "integer-lit":
                break;

            default:
                throw new JSHC.CompilerError("Simplify.reduceExp not defined for " + exp.name);
        }
    return exp;
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
                new_pat.members.push(temp.ident);
                break;
            default:
                throw new Error("Simplify.reduceExp not defined for " + exp.decls[i].name);
        }
    }
    //new_exp = {name:"application", exps: [new_exp], pos: new_exp.pos};
    //new_exp = {name:"infixexp", exps:[new_exp], pos: new_exp.pos};
                
    var new_case = {name:"case", exp: new_exp, 
                             alts: [{name:"alt", pat: new_pat, exp: e.exp}]};

    return new_case; //{name: "infixexp", exps: [new_case], pos: e.pos}
};

JSHC.Simplify.patSimplifyTop = function (ast) {
//    alert("RUNNING PATSIMPLIFY on: " + ast.modid)
    var old = ast.body.topdecls;
    var newbody = [];
    var toMerge = {};

        
    
    for (var i = 0; i < old.length; i++) {
        if (old[i].name === "topdecl-decl" && old[i].decl.name === "decl-fun") {
            var fun = old[i].decl;

            if (toMerge[fun.ident.id] === undefined)
                toMerge[fun.ident.id] = [];
               
            toMerge[fun.ident.id].push(fun);
        } else {
            newbody.push(old[i]);
        }

    }
    for (var k in toMerge) {
        newbody.push({name: "topdecl-decl", decl: JSHC.Simplify.merge(toMerge[k])} );
    }

    ast.body.topdecls = newbody;
};

JSHC.Simplify.patSimplifyDecls = function(ast) {
	var newdecls = [];
	var toMerge = {};
	
	for (var i = 0; i < ast.length; i++)  {
		if (ast[i].name === "decl-fun") {
			var fun = ast[i];
			
			if (toMerge[fun.ident.id] === undefined)
				toMerge[fun.ident.id] = [];
				
			toMerge[fun.ident.id].push(fun);
		} else {
			newdecls.push(ast[i]);
		}
	}
	for (var k in toMerge) {
		newdecls.push(JSHC.Simplify.merge(toMerge[k]));
	}
	
	return newdecls;
};

JSHC.Simplify.merge = function(funs) {
      
      assert.ok(funs.length > 0, "JSHC.Simplify.merge() shouldn't be called with a list of 0 length")
        // check whether a one line function uses matching on its arguments      
      var hasMatching = false;
      for (var i = 0; i < funs[0].args.length; i++) {
          if (funs[0].args[i].name !== "varname" ) {
                hasMatching = true;
                break;
          }
      }
      
      if (funs.length > 1 || hasMatching) {
          var newArgs = [];
          var newAlts = [];
          var newArgsT = [];
          //calculate the new argument list
          for (var j = 0; j < funs[0].args.length; j++) {
              var vrnm = new JSHC.VarName("a" + j, funs[0].pos, false);
              newArgs.push(vrnm);
              //newArgsT.push(vrnm);
          }
          
          newArgsT = {name: "tuple", members: newArgs};
//          alert("newargst:\n" + JSHC.showAST(newArgsT) + "\nnewargs:\n" + JSHC.showAST(newArgs))
          //calculate the alts for the case-expression
          for (var j = 0; j < funs.length; j++) {
              var argsT = {name: "tuple_pat", members: funs[j].args}
              newAlts.push( {name: "alt", pat: argsT, exp: funs[j].rhs} );
          }
          
          //merge the different functions into one with a case-expression                  
          var newRhs = {name: "case", exp: newArgsT, alts: newAlts};
          var res = {name: "decl-fun", ident: funs[0].ident, args: newArgs, rhs: newRhs};
          //res = {name: "topdecl-decl", decl: res}
          
          //push the merged function into the new body
//          alert("pushed a merged function: " + JSHC.showAST(res))
          return res;
      } else if (funs.length === 1){
//          alert("pushed a non-merged function: " + JSHC.showAST(funs[0]))
          return funs[0];
      }
}

////////////////////////////////////////////////////////////////////////////////
