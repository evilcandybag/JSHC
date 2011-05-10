
////////////////////////////////////////////////////////////////////////////////
// Fixity Resolution
// converts infix lists to infix application using correct precedences.

JSHC.Fixity = {};  // Fixity module

/*
  modifies the module AST by rewriting infix lists into function applications.
*/
JSHC.Fixity.fixityResolution = function(module_ast){
//        JSHC.alert(module_ast)
    JSHC.Fixity.translateInfixLists(module_ast.body.fspace,module_ast);
};

////////////////////////////////////////////////////////////////////////////////




/*
  looks up fixity information and defaults to infixl 9 if missing.
*/
JSHC.Fixity.fixityLookup = function(info,name){
        
    var r = name.id.fixity;
    if( r === undefined ){
	r = {fix: "leftfix", prec: 9};
    }
    return r;
};

////////////////////////////////////////////////////////////////////////////////

/*
  takes an infix list and returns an expression using '-' and/or binary
  operators.
  throws exceptions if anything goes wrong, such as precedence errors.
 */
JSHC.Fixity.resolve = function(info,exps) {
    assert.ok( exps instanceof Array );
    for(var i=0;i<exps.length;i++){
	assert.ok(exps[i]!==undefined);
    }
    
    resolve_parseNeg = function(prec, fix){
	assert.ok( exps.length > 0 );
	var e0 = exps[0];
//	JSHC.alert("checking fixity of an exp:",e0)
//	alert("resolve parseNeg of: " + JSHC.showAST(e0));
	if( e0.name === "-" ){
	    if( prec >= 6 ){
		throw new JSHC.SourceError("unary minus can not occur here as outer expression has greater (>=6) precedence.");
	    }
	    exps.shift();
	    rexp = resolve_parseNeg(6, "leftfix");
	    return {name:"negate",exp:rexp,pos:e0.pos};
	} else if( e0.name === "qop" ) {
	    throw new JSHC.CompilerError("unexpected operator in precedence resolution: expected '-' or lexp, got: " + JSHC.showAST(e0));
	} else {  // some arbitrary expression
//	    alert("resolve parse: \n" + JSHC.showAST(exps) + "\n\n" + JSHC.showAST(e0));
	    exps.shift();
	    return resolve_parse(prec,fix,e0);
	}
    };
    
    resolve_parse = function(prec1, fix1, exp1){
	if( exps.length === 0 ){
	    return exp1;
	}
//	JSHC.alert("resolve_parse args\nprec1:",prec1,"fix1:",fix1,"\nexp1:",exp1);
	var exp2 = exps[0];
	if( exp2.name === "qop" ){
	    var exp2_fixity = JSHC.Fixity.fixityLookup(info,exp2);
	    prec2 = exp2_fixity.prec;
	    fix2 = exp2_fixity.fix;
//	    JSHC.alert("prec2:",prec2,"fix2:",fix2,"\nexp2:",exp2);
	
	    if( prec1 === prec2 && (fix1 !== fix2 || fix1 === "nonfix") ){
		throw new JSHC.SourceError("same precedence with non-associative operator");
	    } else if( prec1 > prec2 || (prec1 === prec2 && fix1 == "leftfix" ) ){
	        //this commented out for chained operator applications to work,
	        //i.e. 1 + 2 + 3
//		exps.unshift(exp2);
//		JSHC.alert("unshifted:",exp2,exps,"\nand returned:",exp1);
		return exp1;
	    } else {
//	    alert("resolve_parseNeg:\n\n" + "prec2: " + JSHC.showAST(prec2) + "\n\nfix2: " + JSHC.showAST(fix2));
//                JSHC.alert("before shift: ", exps);
	        exps.shift();
//	        JSHC.alert("shifted:",exps,"\nand calling parseNeg on: ", prec2, fix2)		
		var rexp = resolve_parseNeg(prec2, fix2);
		//rexp = {name:"infix-app", lhs:exp1, op:exp2, rhs:rexp, pos:exp2.pos};
		rexp = {name:"application", exps:[exp2.id,exp1,rexp], pos:exp2.pos, orig:"infix"};
//		alert("FIXED INFIXEXP: \n\n" + JSHC.showAST(rexp));
		return resolve_parse(prec1, fix1, rexp);
	    }
	} else {
	    throw new JSHC.CompilerError("expected operator in precedence resolution, found: " + JSHC.showAST(exp2));
	}
    };
    
    return resolve_parseNeg(-1, "nonfix");
};

////////////////////////////////////////////////////////////////////////////////

/*
  given an AST and a member name, check if the sub-tree referred to by the member
  name is an infix list, and if so, replaces it by using the 'resolve' function.
*/
JSHC.Fixity.translateInfixMember = function(info, ast, member){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST" );
    assert.ok(typeof member === "string", "type of member is not string but: " + typeof member );
    if( ast[member].name === "infixexp" ){
	ast[member] = JSHC.Fixity.resolve(info, ast[member].exps);
	assert.ok( ast[member] !== undefined );
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  given an AST, check if it is an infix list, and if so, apply the 'resolve'
  function and return the result.
*/
JSHC.Fixity.translateInfixExp = function(info, ast){
//        JSHC.alert("translate:", ast)
    if( ast.name === "infixexp" ){
	return JSHC.Fixity.resolve(info, ast.exps);
    } else {
	return ast;
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  replaces all infix lists in an AST.
*/
JSHC.Fixity.translateInfixLists = function(info, ast){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST" );
//    alert("translateInfixLists: " + ast.name);
    var f = JSHC.Fixity.translateInfixLists[ast.name];
    if( f === undefined ){
	throw new Error("no definition for " + JSHC.showAST(ast) ); //+ast.name);
    }
    assert.ok( f instanceof Function, ast.name+" <: Function." )
    f(info, ast);
};

JSHC.Fixity.translateInfixLists["module"] = function(info, ast){
    // ignoring exports as there are no expressions to translate there
    JSHC.Fixity.translateInfixLists(info, ast.body);
};

JSHC.Fixity.translateInfixLists["body"] = function(info, ast){
    var i;
    
    // ignoring imports as there are no expressions to translate there
    
    for(i=0;i<ast.topdecls.length;i++){
	JSHC.Fixity.translateInfixLists(info, ast.topdecls[i]);
    }
};

JSHC.Fixity.translateInfixLists["topdecl-decl"] = function(info, ast){
    JSHC.Fixity.translateInfixLists(info, ast.decl);
};

JSHC.Fixity.translateInfixLists["topdecl-data"] = function(info, ast){
    // no expressions to translate here
};

JSHC.Fixity.translateInfixLists["decl-fun"] = function(info, ast){
    // TODO: currently nothing to do for the LHS.
    //       adding constructor operators will make infix expressions in patterns.
    JSHC.Fixity.translateInfixMember(info, ast, "rhs");
    JSHC.Fixity.translateInfixLists(info, ast.rhs);
};

JSHC.Fixity.translateInfixLists["constrained-exp"] = function(info, ast){
    // no infix expressions in type signatures.
    
    JSHC.Fixity.translateInfixMember(info, ast, "exp");
    // handle sub-expressions afterwards
    JSHC.Fixity.translateInfixLists(info, ast.exp);
};

/*
JSHC.Fixity.translateInfixLists["infix-app"] = function(info, ast){
    JSHC.Fixity.translateInfixMember(info, ast, "lhs");
    JSHC.Fixity.translateInfixMember(info, ast, "rhs");
    // handle sub-expressions afterwards
    JSHC.Fixity.translateInfixLists(info, ast.lhs);
    JSHC.Fixity.translateInfixLists(info, ast.rhs);
};
*/

JSHC.Fixity.translateInfixLists["case"] = function(info, ast) {
    JSHC.Fixity.translateInfixMember(info, ast, "exp");
    JSHC.Fixity.translateInfixLists(info, ast.exp);
    
    for (var i = 0; i < ast.alts.length; i++) {
        JSHC.Fixity.translateInfixMember(info, ast.alts[i], "exp");
        JSHC.Fixity.translateInfixLists(info, ast.alts[i].exp);
    }
};

JSHC.Fixity.translateInfixLists["negate"] = function(info, ast){
    JSHC.Fixity.translateInfixMember(info, ast, "exp");
    JSHC.Fixity.translateInfixLists(info, ast.exp);
};

JSHC.Fixity.translateInfixLists["application"] = function(info, ast){
    var i;
//    alert("App contains: " + JSHC.showAST(ast));
    for(i=0;i<ast.exps.length;i++){
	ast.exps[i] = JSHC.Fixity.translateInfixExp(info, ast.exps[i]);
	JSHC.Fixity.translateInfixLists(info, ast.exps[i]);
    }
};

JSHC.Fixity.translateInfixLists["tuple"] = function(info, ast){
    var i;
//    alert("App contains: " + JSHC.showAST(ast));
    for(i=0;i<ast.members.length;i++){	
//        JSHC.alert("translating this tuple member;", ast.members[i]);    
	ast.members[i] = JSHC.Fixity.translateInfixExp(info, ast.members[i]);
//	JSHC.alert("translated this tuple member;", ast.members[i]);
	JSHC.Fixity.translateInfixLists(info, ast.members[i]);
    }
};

JSHC.Fixity.translateInfixLists["varname"] = function(info, ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["dacon"] = function(info, ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["integer-lit"] = function(info, ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["qop"] = function(info, ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["fixity"] = function(info, ast){
    // nothing
};


////////////////////////////////////////////////////////////////////////////////
