
////////////////////////////////////////////////////////////////////////////////
// Fixity Resolution
// converts infix lists to infix application using correct precedences.

JSHC.Fixity = {};  // Fixity module

/*
  modifies the module AST by rewriting infix lists into function applications.
*/
JSHC.Fixity.fixityResolution = function(module_ast){
//        JSHC.alert(module_ast)
    JSHC.Fixity.translateInfixLists(module_ast);
};

////////////////////////////////////////////////////////////////////////////////

/*
  looks up fixity information and defaults to infixl 9 if missing.
*/
JSHC.Fixity.fixityLookup = function(name){
        
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
JSHC.Fixity.resolve = function(exps) {
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
	    var exp2_fixity = JSHC.Fixity.fixityLookup(exp2);
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
JSHC.Fixity.translateInfixMember = function(ast, member){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST" );
    assert.ok(typeof member === "string", "type of member is not string but: " + typeof member );
    if( ast[member].name === "infixexp" ){
	ast[member] = JSHC.Fixity.resolve(ast[member].exps);
	assert.ok( ast[member] !== undefined );
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  given an AST, check if it is an infix list, and if so, apply the 'resolve'
  function and return the result.
*/
JSHC.Fixity.translateInfixExp = function(ast){
//        JSHC.alert("translate:", ast)
    if( ast.name === "infixexp" ){
	return JSHC.Fixity.resolve(ast.exps);
    } else {
	return ast;
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  replaces all infix lists in an AST.
*/
JSHC.Fixity.translateInfixLists = function(ast){
    assert.ok( ast !== undefined && ast.name !== undefined, "param 'ast' must be an AST" );
//    alert("translateInfixLists: " + ast.name);
    var f = JSHC.Fixity.translateInfixLists[ast.name];
    if( f === undefined ){
	throw new Error("no definition for " + JSHC.showAST(ast) ); //+ast.name);
    }
    assert.ok( f instanceof Function, ast.name+" <: Function." )
    f(ast);
};

JSHC.Fixity.translateInfixLists["module"] = function(ast){
    // ignoring exports as there are no expressions to translate there
    JSHC.Fixity.translateInfixLists(ast.body);
};

JSHC.Fixity.translateInfixLists["body"] = function(ast){
    var i;
    
    // ignoring imports as there are no expressions to translate there
    
    for(i=0;i<ast.topdecls.length;i++){
	JSHC.Fixity.translateInfixLists(ast.topdecls[i]);
    }
};

JSHC.Fixity.translateInfixLists["topdecl-decl"] = function(ast){
    JSHC.Fixity.translateInfixLists(ast.decl);
};

JSHC.Fixity.translateInfixLists["topdecl-data"] = function(ast){
    // no expressions to translate here
};

JSHC.Fixity.translateInfixLists["decl-fun"] = function(ast){
    // TODO: currently nothing to do for the LHS.
    //       adding constructor operators will make infix expressions in patterns.
    JSHC.Fixity.translateInfixMember(ast, "rhs");
    JSHC.Fixity.translateInfixLists(ast.rhs);
};

JSHC.Fixity.translateInfixLists["fun-where"] = function (ast) {
    JSHC.Fixity.translateInfixMember(ast, "exp");
    JSHC.Fixity.translateInfixLists(ast.exp);
    
    for (var i = 0; i < ast.decls.length; i++) {
        JSHC.Fixity.translateInfixLists(ast.decls[i]);
    }
};

JSHC.Fixity.translateInfixLists["let"] = function (ast) {
    JSHC.Fixity.translateInfixMember(ast, "exp");
    JSHC.Fixity.translateInfixLists(ast.exp);
    
    for (var i = 0; i < ast.decls.length; i++) {
        JSHC.Fixity.translateInfixLists(ast.decls[i]);
    }
};

JSHC.Fixity.translateInfixLists["constrained-exp"] = function(ast){
    // no infix expressions in type signatures.
    
    JSHC.Fixity.translateInfixMember(ast, "exp");
    // handle sub-expressions afterwards
    JSHC.Fixity.translateInfixLists(ast.exp);
};

/*
JSHC.Fixity.translateInfixLists["infix-app"] = function(ast){
    JSHC.Fixity.translateInfixMember(ast, "lhs");
    JSHC.Fixity.translateInfixMember(ast, "rhs");
    // handle sub-expressions afterwards
    JSHC.Fixity.translateInfixLists(ast.lhs);
    JSHC.Fixity.translateInfixLists(ast.rhs);
};
*/

JSHC.Fixity.translateInfixLists["case"] = function(ast) {
    JSHC.Fixity.translateInfixMember(ast, "exp");
    JSHC.Fixity.translateInfixLists(ast.exp);
    
    for (var i = 0; i < ast.alts.length; i++) {
        JSHC.Fixity.translateInfixMember(ast.alts[i], "exp");
        JSHC.Fixity.translateInfixLists(ast.alts[i].exp);
    }
};

JSHC.Fixity.translateInfixLists["negate"] = function(ast){
    JSHC.Fixity.translateInfixMember(ast, "exp");
    JSHC.Fixity.translateInfixLists(ast.exp);
};

JSHC.Fixity.translateInfixLists["application"] = function(ast){
    var i;
//    alert("App contains: " + JSHC.showAST(ast));
    for(i=0;i<ast.exps.length;i++){
	ast.exps[i] = JSHC.Fixity.translateInfixExp(ast.exps[i]);
	JSHC.Fixity.translateInfixLists(ast.exps[i]);
    }
};

JSHC.Fixity.translateInfixLists["tuple"] = function(ast){
    var i;
//    alert("App contains: " + JSHC.showAST(ast));
    for(i=0;i<ast.members.length;i++){	
//        JSHC.alert("translating this tuple member;", ast.members[i]);    
	ast.members[i] = JSHC.Fixity.translateInfixExp(ast.members[i]);
//	JSHC.alert("translated this tuple member;", ast.members[i]);
	JSHC.Fixity.translateInfixLists(ast.members[i]);
    }
};

JSHC.Fixity.translateInfixLists["lambda"] = function(ast) {
    JSHC.Fixity.translateInfixMember(ast, "rhs");
    JSHC.Fixity.translateInfixLists(ast.rhs);
};

JSHC.Fixity.translateInfixLists["varname"] = function(ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["dacon"] = function(ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["integer-lit"] = function(ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["qop"] = function(ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["fixity"] = function(ast){
    // nothing
};

JSHC.Fixity.translateInfixLists["type-signature"] = function(ast){
    // nothing
};

////////////////////////////////////////////////////////////////////////////////
