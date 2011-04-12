
////////////////////////////////////////////////////////////////////////////////
// Fixity Resolution
// converts infix lists to infix application using correct precedences.

JSHC.Fixity = {};  // Fixity module

/*
  modifies the module AST by rewriting infix lists into function applications.
*/
JSHC.Fixity.fixityResolution = function(module_ast){
    var info = JSHC.Fixity.findInfo(module_ast);
    JSHC.Fixity.translateInfixLists(info,module_ast);
};

////////////////////////////////////////////////////////////////////////////////

/*
  produces a map from operator name (both id and symbol possible) to
  {fix,prec} object.
*/
JSHC.Fixity.findInfo = function(module_ast){
    // TODO: find operator precedences by filtering out all top-level fixity
    //       declarations and producing a map from operators to fixity.
    //       Q:is this affected by built-in syntax and if the Prelude was
    //         imported ?
    return {};
};

////////////////////////////////////////////////////////////////////////////////

/*
  looks up fixity information and defaults to infixl 9 if missing.
*/
JSHC.Fixity.fixityLookup = function(info,name){
    var r = info[name.id];
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
JSHC.Fixity.resolve = function(info,exps){
    assert.ok( exps instanceof Array );
    for(var i=0;i<exps.length;i++){
	assert.ok(exps[i]!==undefined);
    }
    Array.reverse(exps);
    
    resolve_parseNeg = function(prec, fix){
	assert.ok( exps.length > 0 );
	const e0 = exps[0];
	if( e0.name === "-" ){
	    if( prec >= 6 ){
		throw new JSHC.SourceError("unary minus can not occur here as outer expression has greater (>=6) precedence.");
	    }
	    exps.pop();
	    rexp = resolve_parseNeg(6, "leftfix");
	    return {name:"negate",exp:rexp,pos:e0.pos};
	} else if( e0.name === "qop" ) {
	    throw new JSHC.CompilerError("unexpected operator in precedence resolution: expected '-' or lexp");
	} else {  // some arbitrary expression
	    exps.pop();
	    return resolve_parse(prec,fix,e0);
	}
    };
    
    resolve_parse = function(prec1, fix1, exp1){
	if( exps.length === 0 ){
	    return exp1;
	}
	
	const exp2 = exps[0];
	if( exp2.name === "qop" ){
	    var exp2_fixity = JSHC.Fixity.fixityLookup(info,exp2);
	    prec2 = exp2_fixity.prec;
	    fix2 = exp2_fixity.fix;
	    if( prec1 === prec2 && (fix1 !== fix2 || fix1 === "nonfix") ){
		throw new JSHC.SourceError("same precedence with non-associative operator");
	    } else if( prec1 > prec2 || (prec1 === prec2 && fix1 == "leftfix" ) ){
		exps.push(exp2);
		return exp1;
	    } else {
		var rexp = resolve_parseNeg(prec2, fix2);
		//rexp = {name:"infix-app", lhs:exp1, op:exp2, rhs:rexp, pos:exp2.pos};
		rexp = {name:"application", exps:[exp2,exp1,rexp], pos:exp2.pos, orig:"infix"};
		return resolve_parse(prec1, fix1, rexp);
	    }
	} else {
	    throw new JSHC.CompilerError("expected operator in precedence resolution");
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
    assert.ok(typeof member === "string" );
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
    if( ast.name === "infixexp" ){
	return JSHC.Fixity.resolve(info, ast[member].exps);
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
    var f = JSHC.Fixity.translateInfixLists[ast.name];
    if( f === undefined ){
	throw new Error("no definition for "+ast.name);
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

JSHC.Fixity.translateInfixLists["infix-app"] = function(info, ast){
    JSHC.Fixity.translateInfixMember(info, ast, "lhs");
    JSHC.Fixity.translateInfixMember(info, ast, "rhs");
    // handle sub-expressions afterwards
    JSHC.Fixity.translateInfixLists(info, ast.lhs);
    JSHC.Fixity.translateInfixLists(info, ast.rhs);
};

JSHC.Fixity.translateInfixLists["negate"] = function(info, ast){
    JSHC.Fixity.translateInfixMember(info, ast, "exp");
    JSHC.Fixity.translateInfixLists(info, ast.exp);
};

JSHC.Fixity.translateInfixLists["application"] = function(info, ast){
    var i;
    
    for(i=0;i<ast.exps.length;i++){
	ast.exps[i] = JSHC.Fixity.translateInfixExp(info, ast.exps[i]);
	JSHC.Fixity.translateInfixLists(info, ast.exps[i]);
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

////////////////////////////////////////////////////////////////////////////////
