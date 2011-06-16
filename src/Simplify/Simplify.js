
////////////////////////////////////////////////////////////////////////////////

JSHC.Simplify.runSimplify = function(ast) {
    JSHC.Simplify.ast_modid = ast.modid
//    JSHC.alert("SIMPLIFYING:\n\n", ast); 
    JSHC.Simplify.patSimplifyTop(ast);
//    alert("AFTER patsimplify:\n\n" + JSHC.showAST(ast))
    JSHC.Simplify.simplifyModule(ast);
//    alert("AFTER simplify:\n\n" + JSHC.showAST(ast))
    JSHC.Simplify.renameLocalNames(ast);
}

//JSHC.Simplify.simplify = function(ast){
//    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST");
//    var f = this.simplify[ast.name];
//    if( f === undefined ){
//        throw new Error("no definition for "+ast.name);
//    }
//    assert.ok( f instanceof Function, ast.name+" <: Function." )
//    f.call(this,ast);
//};

JSHC.Simplify.simplifyModule = function(ast){
    JSHC.Simplify.simplifyBody(ast.body);
};

JSHC.Simplify.simplifyBody = function(ast){
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
	        JSHC.Simplify.simplifyDeclFun(ts[i].decl);
	    }
	}
    }
};

JSHC.Simplify.simplifyDeclFun = function(ast){
    // take all parameters in the LHS and add as lambdas on the RHS.

    var i;
    var new_rhs;
    
    if (ast.rhs.name === "fun-where") {
    	//JSHC.alert("args.length", ast.args.length);
    	new_rhs = ast.rhs;
    	new_rhs.decls = JSHC.Simplify.patSimplifyDecls(new_rhs.decls);
    	for (var i = 0; i < new_rhs.decls.length; i++) {
	    JSHC.Simplify.simplifyDeclFun(new_rhs.decls[i]);
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
                    JSHC.Simplify.simplifyDeclFun(exp.decls[i]);
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
        JSHC.Simplify.simplifyDeclFun(temp);
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

/*
  merge top-decls for same identifier
*/
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

JSHC.Simplify.renameLocalNames = function(ast){
    var topdecls = ast.body.topdecls;

    var usednames = new JSHC.Set(false);

    // find all declared and used names in sub-expressions and add to a set
    // starting with all top-level variable names. any local renames will work
    // as long as no names in this set is used.
    for (var ix = 0; ix < topdecls.length; ix++) {
        if (topdecls[ix].name === "topdecl-decl" && topdecls[ix].decl.name === "decl-fun") {
            JSHC.Simplify.findUsedNamesInDecl(usednames, topdecls[ix].decl);
        }
    }

    // rename local names
    var namemaps = [{}];
    for (var ix = 0; ix < topdecls.length; ix++) {
        if (topdecls[ix].name === "topdecl-decl" && topdecls[ix].decl.name === "decl-fun") {
            JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, topdecls[ix].decl.rhs);
        }
    }
};

JSHC.Simplify.renameLocalDeclaredName = function(usednames, namemaps, old_name){

    // check if valid javascript name. if so, do not change it.
    if( old_name.id.match(/[a-zA-Z][a-zA-Z0-9_]*/) ){
        return old_name;
    }

    var old_ident = old_name.id;
    var new_ident = [];

    // produce a new name
    for(var ix=0 ; ix<old_ident.length ; ix++ ){
        var ch = old_ident[ix];
        if( ch.match(/[a-zA-Z0-9_]/) ){
            new_ident.push(ch);
            continue;
        }
        switch( old_ident[ix] ){
        case '!': new_ident.push("bang"); break;
        case '#': new_ident.push("hash"); break;
        case '$': new_ident.push("buck"); break;
        case '%': new_ident.push("mod"); break;
        case '&': new_ident.push("and"); break;
        case '*': new_ident.push("star"); break;
        case '+': new_ident.push("plus"); break;
        case '.': new_ident.push("dot"); break;
        case '/': new_ident.push("slash"); break;
        case '<': new_ident.push("lt"); break;
        case '=': new_ident.push("eq"); break;
        case '>': new_ident.push("gt"); break;
        case '?': new_ident.push("maybe"); break;
        case '@': new_ident.push("at"); break;
        case '\\':new_ident.push("back"); break;
        case '^': new_ident.push("roof"); break;
        case '|': new_ident.push("bar"); break;
        case '-': new_ident.push("sub"); break;
        case '~': new_ident.push("tilde"); break;
        case ':': new_ident.push("colon"); break;
        default:  new_ident.push("_");
        }
    }
    new_ident = new_ident.join("");

    // make sure the new name is unique
    var number = 0;
    while( usednames.contains(new_ident+number) === true ){
        number++;
    }
    new_ident = new_ident + number;

    // create new name using the new ident
    new_name = new JSHC.VarName(new_ident,{},false);

    // must add new name to both 'usednames' and 'namemaps'.
    namemaps[namemaps.length-1][old_ident] = new_name;
    usednames.add([new_ident]);

    //JSHC.alert("renameLocalName: declared: \n",new_ident,"\ninstead of\n",old_ident);

    return new_name;
};

JSHC.Simplify.renameLocalUsedName = function(usednames, namemaps, name){
    // ignore qualified names
    if( name.loc !== undefined ){
        return name;
    }

    var replacement;
    for(var ix=namemaps.length-1 ; ix>=0 ; ix--){
        replacement = namemaps[ix][name.id];
	if( replacement !== undefined ){
	    break;
	}
    }
    if( replacement === undefined )return name;

    //JSHC.alert("renameLocalName: used:\n",name);

    assert.ok( replacement instanceof JSHC.VarName );
    return replacement;
};

JSHC.Simplify.renameLocalNamesInDecl = function(usednames, namemaps, decl){

    // rename declared name
    decl.ident = JSHC.Simplify.renameLocalDeclaredName(usednames, namemaps, decl.ident);

    namemaps.push({});

    // rename names in patterns
    for(var ix=0; ix < decl.args.length ; ix++ ){
        decl.args[ix] = JSHC.Simplify.renameLocalNamesInPat(usednames, namemaps, decl.args[ix]);
    }

    // rename names in the RHS
    decl.rhs = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, decl.rhs);

    namemaps.pop();
};

/*
    returns the new pattern
*/
JSHC.Simplify.renameLocalNamesInPat = function(usednames, namemaps, pat){
    switch (pat.name) {
    case "varname":
        return JSHC.Simplify.renameLocalDeclaredName(usednames, namemaps, pat);

    case "tuple_pat":
        // rename within each member in exp.members
        for(var ix=0 ; ix<pat.members.length ; ix++){
            pat.members[ix] = JSHC.Simplify.renameLocalNamesInPat(usednames, namemaps, pat.members[ix]);
        }
        return pat;

    case "dacon":
    case "integer-lit":
        return pat;

    case "conpat":
        // rename within each pat in pat.pats
        for(var ix=0 ; ix<pat.pats.length ; ix++){
            pat.pats[ix] = JSHC.Simplify.renameLocalNamesInPat(usednames, namemaps, pat.pats[ix]);
        }
        return pat;

    case "wildcard":
        return pat;

    default:
        throw new JSHC.CompilerError("Simplify.renameLocalNamesInPat not defined for " + pat.name);
    }
};

/*
    returns the new expression
*/
JSHC.Simplify.renameLocalNamesInExp = function(usednames, namemaps, exp){
    switch (exp.name) {
    case "lambda":
        // rename in each pattern
        for(var ix=0 ; ix<exp.args.length ; ix++){
            exp.args[ix] = JSHC.Simplify.renameLocalNamesInPat(usednames, namemaps, exp.args[ix]);
        }

        exp.rhs = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, exp.rhs);
        return exp;

    case "tuple":
        // rename within each member in exp.members
        for(var ix=0 ; ix<exp.members.length ; ix++){
            exp.members[ix] = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, exp.members[ix]);
        }
        return exp;

    case "case":
        // rename within exp.exp
        exp.exp = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, exp.exp);

        // rename within each alternative alt in exp.alts
        for(var ix=0 ; ix<exp.alts.length ; ix++){
            exp.alts[ix].pat = JSHC.Simplify.renameLocalNamesInPat(usednames, namemaps, exp.alts[ix].pat);
            exp.alts[ix].exp = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, exp.alts[ix].exp);
        }
        return exp;

    case "application":
        // rename within each exp in exp.exps
        for(var ix=0 ; ix<exp.exps.length ; ix++){
            exp.exps[ix] = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, exp.exps[ix]);
        }
        return exp;

    case "fun-where":
    case "let":
        namemaps.push({});
        for(var ix=0 ; ix<exp.decls.length ; ix++){
            JSHC.Simplify.renameLocalNamesInDecl(usednames, namemaps, exp.decls[ix]);
        }
        exp.exp = JSHC.Simplify.renameLocalNamesInExp(usednames, namemaps, exp.exp);
        namemaps.pop();
        return exp;

    case "dacon":
    case "integer-lit":
        return exp;

    case "varname":
        return JSHC.Simplify.renameLocalUsedName(usednames, namemaps, exp);

    default:
        throw new JSHC.CompilerError("Simplify.renameLocalNamesInExp not defined for " + exp.name);
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Simplify.findUsedNamesInDecl = function(usednames, decl){
    usednames.add(decl.ident.id);
    for(var ix=0; ix < decl.args.length ; ix++ ){
        JSHC.Simplify.findUsedNamesInPat(usednames, decl.args[ix]);
    }
    JSHC.Simplify.findUsedNamesInExp(usednames, decl.rhs);
};

JSHC.Simplify.findUsedNamesInPat = function(usednames, pat){
    switch (pat.name) {
    case "varname":
        usednames.add(pat.id);
        break;

    case "tuple_pat":
        for(var ix=0 ; ix<pat.members.length ; ix++){
            JSHC.Simplify.findUsedNamesInPat(usednames, pat.members[ix]);
        }
        break;

    case "dacon":
    case "integer-lit":
        break;

    case "conpat":
        // rename within each pat in pat.pats
        for(var ix=0 ; ix<pat.pats.length ; ix++){
            JSHC.Simplify.findUsedNamesInPat(usednames, pat.pats[ix]);
        }
        break;

    case "wildcard":
        break;

    default:
        throw new JSHC.CompilerError("Simplify.findUsedNamesInPat not defined for " + pat.name);
    }
};

/*
    returns the new expression
*/
JSHC.Simplify.findUsedNamesInExp = function(usednames, exp){
    switch (exp.name) {
    case "lambda":
        for(var ix=0 ; ix<exp.args.length ; ix++){
            JSHC.Simplify.findUsedNamesInPat(usednames, exp.args[ix]);
        }
        JSHC.Simplify.findUsedNamesInExp(usednames, exp.rhs);
        break;

    case "tuple":
        for(var ix=0 ; ix<exp.members.length ; ix++){
            JSHC.Simplify.findUsedNamesInExp(usednames, exp.members[ix]);
        }
        break;

    case "case":
        JSHC.Simplify.findUsedNamesInExp(usednames, exp.exp);
        for(var ix=0 ; ix<exp.alts.length ; ix++){
            JSHC.Simplify.findUsedNamesInPat(usednames, exp.alts[ix].pat);
            JSHC.Simplify.findUsedNamesInExp(usednames, exp.alts[ix].exp);
        }
        break;

    case "application":
        for(var ix=0 ; ix<exp.exps.length ; ix++){
            JSHC.Simplify.findUsedNamesInExp(usednames, exp.exps[ix]);
        }
        break;

    case "fun-where":
    case "let":
        for(var ix=0 ; ix<exp.decls.length ; ix++){
            JSHC.Simplify.findUsedNamesInDecl(usednames, exp.decls[ix]);
        }
        JSHC.Simplify.findUsedNamesInExp(usednames, exp.exp);
        break;

    case "dacon":
    case "integer-lit":
        break;

    case "varname":
        usednames.add(exp.id);
        break;

    default:
        throw new JSHC.CompilerError("Simplify.findUsedNamesInExp not defined for " + exp.name);
    }
};

////////////////////////////////////////////////////////////////////////////////
