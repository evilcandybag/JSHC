
if( JSHC.Check === undefined )JSHC.Check = {};

JSHC.Check.typeCheck = function(comp,modules){
    try{
        JSHC.Check.typeCheckModules(comp,modules);
    }catch(err){
        if( err instanceof JSHC.TypeError ){
            comp.onError("type error: "+err.toString());
        } else {
            JSHC.alert("error in type checking\n",JSHC.showError(err));
        }
    }
};

/*
  type check an array of modules
*/
JSHC.Check.typeCheckModules = function(comp,modules){
    assert.ok( modules instanceof Array );

    // compute the set of locations which are being type checked
    var locations = {};
    for(var i=0 ; i<modules.length ; i++){
        var loc = modules[i].modid.toString();
        locations[loc] = null;
    }

    // create entries for topdecls
    var entrymap = {};
    for(var i=0 ; i<modules.length ; i++){
        var module = modules[i];

        var topdecls = module.body.topdecls;

        for(var j=0 ; j<topdecls.length ; j++){
            var topdecl = topdecls[j];
            //if the declaration is a fixity declaration, no typechecking needs to be done.
            if (topdecl.name === "topdecl-decl" && topdecl.decl.name === "fixity")
                continue;
                
            var deps = JSHC.Check.computeUsedQualifiedNames(topdecl);
            for(var dep in deps){
                var loc = deps[dep].loc;
                // remove all used names which are NOT referring to any topdecl
                // in any of the modules being checked.
                if( locations[loc] === undefined ){
                    delete deps[dep];
                }
            }
            var names = JSHC.Check.computeDeclaredQualifiedNames(topdecl);

            var entry = new JSHC.Dep.Entry([topdecl],names,deps);
            for( var k in names ){
                var current_entry = entrymap[names[k]];
                //JSHC.alert("current keys: "+JSHC.showKeys(entrymap),"\ncurrent entry("+names[k]+"): ",current_entry);
                if( current_entry === undefined ){
                    assert.ok( entry !== undefined );
                    entrymap[names[k]] = entry;
                } else {
                    // add declared names, used names, and values to the
                    // existing entry.
                    for( var l in names ){
                        current_entry.addName(names[l]);
                    }
                    for( var l in deps ){
                        current_entry.addIncoming(deps[l]);
                    }
                    current_entry.addValue(topdecl);
                }
            }
        }
    }

    // create action for each group
    var action = function(entry){
        //JSHC.alert("type group (topdecls):",entry);

        // read module name from entry and pass along.
        JSHC.Check.typeCheckTopdecls(comp,entry.name.loc,entry.values);
    }

    // create and traverse groups in dependency order
    JSHC.Dep.check(entrymap,action);
};

JSHC.Check.typeCheckTopdecls = function(comp,module,topdecls){

    // created for each group of topdecls, but could just as well be created
    // once and used for all modules. doing it like this means that it does
    // not have to be pass around.
    //var freevars = new JSHC.Check.Freevars();

    // TODO: add type variables to names that are visible to all declarations
    //       in the group.
    var ctx = new JSHC.Check.Ctx();

    for(var ix=0 ; ix<topdecls.length ; ix++){
        try {
	    JSHC.Check.checkTopdecl(comp,ctx,topdecls[ix]);
        } catch( err ){
            if( err instanceof JSHC.SourceError ){
                if( err.mname === undefined ){
                   //err.mname = module.modid.id;
                }
                comp.onError(err);
            } else {
                throw err;
            }
        }
    }
};

JSHC.Check.checkTopdecl = function(comp,ctx,ast){
    try {
  switch( ast.name ){
  case "topdecl-decl":
     ast = ast.decl;
     switch( ast.name ){
     case "decl-fun":

	 ctx.push();
	 var ident = ast.ident;
	 var ident_tv = ctx.add(ident);

         var rhs_type = JSHC.Check.checkExpPattern(comp,ctx,ast.args,ast.rhs);

	 //var e_ident_type = [].concat(params_tv);
	 //e_ident_type.push(rhs_type);
	 //e_ident_type = new JSHC.FunType(e_ident_type);

	 // free the type variables <ident_tv> and <params_tv>.
	 //for(ix in params_tv){
	 //    ctx.freeTyVar(params_tv[ix]);
	 //}
	 //ctx.freeTyVar(ident_tv);

	 // quantify the remaining free type variables used by the params to
	 // produce the decl type.
	 //ident.type = ctx.quantify(ident);

	 // removes the names that are no longer needed and will not be
	 // quantified. this should free all remaining type variables in the
	 // current tyvar context.
	 //for(ix in params){
             //rhs_type = new JSHC.FunType([ctx.lookup(params[ix]),rhs_type]);
	     //ctx.rem(params[ix]);
	     //ctx.pop();
	 //}

         ctx.constrain(ident_tv, rhs_type);
         ident.type = ctx.quantify(ident);
	 ctx.pop();
	 break;

     // skip fixity and type signature declarations
     // TODO: should have been removed by the name checker.
     case "fixity": case "type-signature":
         break;
     default:
         throw new JSHC.CompilerError("decl: missing case: "+ast.name);
     };

  break;
  case "topdecl-data": // .constrs

	 ctx.push();
	 var tycon = ast.typ.tycon;
	 
	 // since all types are declared at top-level, all references to them
	 // are qualified, so no purpose of adding the tycon to the local
	 // context since it will never be used.
	 // the type must instead of placed on the name in the tspace.
	 //var tycon_tv = ctx.add(tycon);
	 tycon.kind = ctx.newBoundTyVar();
	 
         var params = ast.typ.vars;
	 for(var ix=0 ; ix<params.length ; ix++){
	     var param = params[ix];
	     ctx.push();
	     ctx.add(param);   // automatically get a new kivar
         }
         
         for(var ix=0 ; ix<ast.constrs.length ; ix++){
             var constr = ast.constrs[ix];
             for(var ty_ix=0 ; ty_ix<constr.types.length ; ty_ix++){
                 var ty = constr.types[ty_ix];
                 var kind = JSHC.Check.checkType(comp,ctx,ty);
                 ctx.constrain(kind,JSHC.Check.StarKind);
             }
         }

         rhs_kind = JSHC.Check.StarKind;
	 for(var ix=params.length-1 ; ix>=0 ; ix--){
	     var param = params[ix];
             rhs_kind = new JSHC.FunType([ctx.lookupKind(comp,param),rhs_kind]);
	     ctx.rem(param);
	     ctx.pop();
	 }

         ctx.constrain(tycon.kind, rhs_kind);

         // replace all remaining type variables with "*".
         tycon.kind = ctx.simplify(tycon.kind);
         tycon.kind = ctx.quantifyKind(tycon.kind);

         // create tycon type (tycon applied to the type vars).
         // this is the result type of the dacons.
         tycon_type = tycon;
	 for(var ix=0 ; ix<params.length ; ix++){
	     var param = params[ix];
	     tycon_type = new JSHC.AppType(tycon_type,param);
         }

         // create types for dacons.
         for(var ix=0 ; ix<ast.constrs.length ; ix++){
             var constr = ast.constrs[ix];
             var dacon_type;
             if( constr.types.length > 0 ){
                 dacon_type = [].concat(constr.types);
                 dacon_type.push(tycon_type);
                 dacon_type = new JSHC.FunType(dacon_type);
             } else {
                 dacon_type = tycon_type;
             }
             constr.dacon.type = ctx.quantifyType(dacon_type);
             
             // debug: see if types and kinds are added
             //JSHC.alert("datatype: ",tycon.id," : ",tycon.kind.toString(),"\ndacon: ",constr.dacon.id," : ",constr.dacon.type.toString());
         }

	 ctx.pop();
	 break;

     // add all ast.typ.vars to the context.
     // check each ast.constrs while resolving constraints.
     // replace all free variables with "*", then eliminate the ast.typ.vars,
     // then check if the type/kind is correct for each remaining variable that
     // is referred to. all other variables (that are not referred to) is the
     // type constructor and the type variables for it.
     // Q:do this after checking all decls in a whole group ?
     
     // give each of the data constructors the type that they have in the type
     // declaration.
  break;
  default:
      throw new JSHC.CompilerError("topdecl: missing case: "+ast.name);
  };
  // ...
  // Q:return new constraints ?
  // return inferred_type;
  
        } catch( err ){
            if( err instanceof JSHC.SourceError ){
                if( err.pos === undefined ){
                   err.pos = ast.pos;
                }
            }
            throw err;
        }
};

JSHC.Check.checkType = function(comp,ctx,ast){
    assert.ok( ctx !== undefined );
    assert.ok( ast !== undefined );

    switch( ast.name ){

    case "tycon": case "tyvar":
        // lookup kind of tycon/kivar and return it
        return ctx.lookupKind(comp,ast);
    
    case "apptype":
        var lhs_kind = JSHC.Check.checkType(comp,ctx,ast.lhs);
        var rhs_kind = JSHC.Check.checkType(comp,ctx,ast.rhs);
        var ret_type = ctx.newUnboundTyVar();

        var fun_type = new JSHC.FunType([rhs_kind, ret_type]);
        ctx.constrain(lhs_kind,fun_type);
        return ret_type;

    default:
	throw new Error("missing case for "+ast.name);
    }
};

JSHC.Check.checkExp = function(comp,ctx,ast){
    assert.ok( ctx !== undefined );
    assert.ok( ast !== undefined );

    try {

    switch( ast.name ){

    case "infixexp": // should not be here. assume single entry.
	assert.ok( ast.exps.length === 1 );
	return JSHC.Check.checkExp(comp,ctx,ast.exps[0]);
	break;

    case "fun-where": // .decls .exp
	// check ast.decls (create dep groups of list of "decl-fun")
	// add a map to the context and insert all declared names.
	// call JSHC.Check.checkDecls for each group to get the types.
	ctx.push();      
	
	// check the expression (also in scope of the declarations)
	var ty = JSHC.Check.checkExp(comp,ctx,ast.exp);
      
	// remove context with all names from the where-declaration.
	ctx.pop();
	return ty;
	break;

    case "ite": // .e1 .e2 .e3
	// infer types from e1, e2, and e3 to get t1, t2, t3.
	var t1 = JSHC.Check.checkExp(comp,ctx,ast.e1);
	var t2 = JSHC.Check.checkExp(comp,ctx,ast.e2);
	var t3 = JSHC.Check.checkExp(comp,ctx,ast.e3);
	
	// enforce "t1 = Prelude.Bool" and "t2 = t3". return t2.
	ctx.constrain(t1,new JSHC.TyCon("Prelude.Bool"));
	ctx.constrain(t2,t3);
	return ctx.simplify(t2);
	break;

    case "application": // .exps ([qvar/gcon/literal/exp/tuple])
        if( ast.exps.length == 1 ){
            return JSHC.Check.checkExp(comp,ctx,ast.exps[0]);
	} else {
	    var exp_types = [];
	    for(var ix=0 ; ix<ast.exps.length ; ix++ ){
	        exp_types.push(JSHC.Check.checkExp(comp,ctx,ast.exps[ix]));
	        //JSHC.alert("got ",exp_types[exp_types.length-1]," from ",ast.exps[ix]);
	    }
            //JSHC.alert(exp_types);
            //JSHC.alert(ctx.toString());

	    var fun_type = exp_types[0];
	    exp_types.shift();
	    var ret_type = ctx.newUnboundTyVar();
	    exp_types.push(ret_type);
            var inferred_type = new JSHC.FunType(exp_types);
            //JSHC.alert("constraining ",fun_type.toString()," to ",inferred_type.toString());
            try{
                ctx.constrain(fun_type,inferred_type);
            } catch(err){
                if( err instanceof JSHC.TypeError ){
                    err.value = ast.exps[0];
                }
                throw err;
            }
	    return ret_type;
        }
	//if( ! (fun_type instanceof JSHC.FunType) ){
	//    throw new Error("non-function can not be applied to arguments");
	//}
	//ctx.constrain(fun_type,new JSHC.FunType([arg_type,ret_type]));
/*
	// when NOT applying too many arguments
        if( fun_type.types.length >= ast.exps.length ){
            // produce a constraint for each param+argument pair
	    for(var arg=1 ; arg<ast.exps.length ; arg++ ){

            // return the remaining number of params + return type
        } else {
            // for each of the fun_type.types.length-1 params that
            // are known, produce a constraint for each param+argument pair.
            // return the return type of the function type, which must be
            // constrained to the be same as the remaining
            // argument types + a new tyvar.
        }
*/
	break;

    case "lambda": // .args (apat: [var/gcon/literal/tuple_pat]) .rhs (rec)
        return JSHC.Check.checkExpPattern(comp,ctx, ast.args, ast.rhs);

    case "case": // .exp (rec) .alts ([{pat: apat/({name: "conpat", con: gcon, pats: apats})], exp: exp}])
	return undefined;
	break;
    
    case "let": // .decls .exp
	// (as for where)
	return undefined;
	break;

    case "integer-lit":
        // should be "forall a. Num a => a"
        return new JSHC.TyCon("Int32",{},"Data.Int");

    case "dacon": case "varname":
        return ctx.lookupType(comp,ast);

    default:
	throw new Error("missing case for "+ast.name);
  };

        } catch( err ){
            if( err instanceof JSHC.SourceError ){
                if( err.pos === undefined ){
                   err.pos = ast.pos;
                }
            }
            throw err;
        }
};

/*
  checks an expression given some arguments.
*/
JSHC.Check.checkExpPattern = function(comp,ctx,args,rhs){
	 for(var ix=0 ; ix<args.length ; ix++){
	     var param = args[ix];
	     switch( param.name ){
	     case "varname":
	         ctx.push();
	         ctx.add(param);   // automatically get a new tyvar
	         break;
	     case "integer-lit":
	         break;
	     case "dacon":
	         // look up the type. if the type is a function type, then give
	         // type error, else do nothing and just add this type as a
	         // parameter type when building up the function type after
	         // checking the RHS.
	         var dacon_type = ctx.lookupType(comp,param);
	         if( dacon_type instanceof JSHC.FunType ){
	             throw new JSHC.SourceError(undefined, param.pos, "data constructor "+param+"must be given arguments");
	         }
	         break;
	     
	     default:
	         throw new Error("missing case for " + param.name);
	     }
	 }

	 // check RHS:
	 var rhs_type = JSHC.Check.checkExp(comp,ctx,rhs);
	 assert.ok( rhs_type !== undefined );

	 // removes the names that are no longer needed and will not be
	 // quantified. this should free all remaining type variables in the
	 // current tyvar context.
	 for(var ix=args.length-1 ; ix>=0 ; ix--){
	     var param = args[ix];
	     switch( param.name ){
	     case "varname":
                 rhs_type = new JSHC.FunType([ctx.lookupType(comp,param),rhs_type]);
	         ctx.rem(param);
	         ctx.pop();
	         break;
	     case "dacon":
	         // look up the type and use the type as the parameter type.
	         rhs_type = new JSHC.FunType([ctx.lookupType(comp,param),rhs_type]);
	         break;
	     case "integer-lit":
                 // should be "forall a. Num a => a"
	         var integer_lit_type = new JSHC.TyCon("Data.Int.Int32");
	         rhs_type = new JSHC.FunType([integer_lit_type,rhs_type]);
	         break;
	     default:
	         throw new Error("missing case for " + param.name);
	     }
	 }

	return rhs_type;
};

////////////////////////////////////////////////////////////////////////////////

// note: can only eliminate type variables that are out-of-scope.
// global variables that become out-of-scope will have their type stored in the
// name object, while local variables will just disappear as they are now
// unreachable.

// unifies the equations and returns a substitution.
JSHC.Check.unifyS = function(equations,ctx){
  // ...
  return ctx;
};

////////////////////////////////////////////////////////////////////////////////

// list of maps from names to types that represents the local contexts.
JSHC.Check.Ctx = function(){
    this.freevars = new JSHC.Check.Freevars();

    this.contexts = [];  // sets of name
    this.tyvars = []; // sets of existing tyvars
    //this.unresolved = {}; // mapping from name to type
    this.tyvar_ctx = {}; // mapping from tyvar to type
};
/*
  checks if tyvar is bound by any outer or current declaration.
*/
JSHC.Check.Ctx.prototype.isUnboundTyVar = function(tyvar1){
  // return true if and only if not in this.tyvars
  for(var ix=0 ; ix<this.tyvars.length ; ix++){
    var tyvar_ctx = this.tyvars[ix];
    for(var tyvar2 in tyvar_ctx){
      if( tyvar1 === tyvar2 ){
        return false;
      }
    }
  }
  return true;
};
JSHC.Check.Ctx.prototype.toString = function(){
    var m = [];
    var wrote;

    m.push("declared names:\n");
    wrote = false;
    for(var c=0 ; c<this.contexts.length ; c++){
	for(var n in this.contexts[c]){
	    wrote = true;
	    m.push(n);
	    m.push(" : ");
	    m.push(this.contexts[c][n].toString());
	    m.push(",");
	}
    }
    if( wrote )m.pop();

    m.push("\nconstraints:\n");
    wrote = false;
    for(var c=0 ; c<this.tyvar_ctx.length ; c++){
	wrote = true;
	m.push(c);
	m.push(" = ");
	m.push(this.tyvar_ctx[c].toString());
	m.push(",");
    }
    if( wrote )m.pop();
    return m.join("");
};

/*
  replace all kivars with "*"
*/
JSHC.Check.Ctx.prototype.quantifyKind = function(type){
    return JSHC.Check.kindify(type);
};

JSHC.Check.Ctx.prototype.quantifyType = function(type){
    // step1: compute the set of type variables in the type
    var used = JSHC.Check.computeUsedVars(type);

    // step2: compute the intersection of the result from step1 and the
    //        current set of type variables to get the smallest possible
    //        set that quantifies all that may be quantified.
    var empty = true;
    for(var k in used){
	if( this.isUnboundTyVar(k) ){
	    empty = false;
	} else {
	    delete used[k];
	}
    }

    var keyAmount = JSHC.numberOfKeys(used);
    var binds = {};
    if( keyAmount > 26 ){
        var n=0;
        for(var u in used){
            var tyvar = new JSHC.TyVar("t"+n);
            binds[tyvar] = tyvar;
            used[u] = tyvar;
            n++;
        }
    } else {
        var c=97;
        for(var u in used){
            var tyvar = new JSHC.TyVar(String.fromCharCode(c));
            binds[tyvar] = tyvar;
            used[u] = tyvar;
            c++;
        }
    }

    if( ! empty ){
        type = JSHC.Check.replaceTyVars(used, type);
        type = new JSHC.ForallType(binds, type);
    }
    return type;
};

JSHC.Check.Ctx.prototype.quantify = function(name){

    // TODO: replace all occurences of tyvars in the type that are in
    // the current (innermost) context with new type variables 't0', 't1', etc..
    // and quantify them.

    //var curr_tvs = this.tyvars[this.tyvars.length-1];
    var curr_ctx = this.contexts[this.contexts.length-1];
    curr_ctx[name] = this.quantifyType(curr_ctx[name]);
    return curr_ctx[name];
};


//JSHC.Check.Ctx.prototype.clearTyVars = function(){
    //this.freevars = new Freevars();
//    this.tyvars = {};
//    this.constraints = {};
//};
/*
JSHC.Check.Ctx.prototype.freeTyVar = function(tyvar){
    if( this.tyvars[tyvar] === undefined ){
	throw new Error("unable to free type variable "+tyvar+" as it is not bound.");
    }
    delete this.tyvars[tyvar];

    // remove from contraints if possible.
    var rhs = this.constraints[tyvar];
    if( rhs === undefined )return;

    // find all occurences of the tyvar in the RHSs and replace with 'rhs'.
    for(var c in this.constraints){
        this.constraints[c] = JSHC.Check.replaceTyvarWith(tyvar,rhs,this.constraints[c]);
    }
};
*/
JSHC.Check.Ctx.prototype.newBoundTyVar = function(){
    var tyvar = this.freevars.next();
    this.tyvars[this.tyvars.length-1][tyvar] = tyvar;
    return tyvar;
};
JSHC.Check.Ctx.prototype.newUnboundTyVar = function(){
    var tyvar = this.freevars.next();
    return tyvar;
};
/*
  takes two types and adds appropriate constraints or throws a type error
*/
JSHC.Check.Ctx.prototype.constrain = function(type1,type2){
    assert.ok( type1 !== undefined );
    assert.ok( type2 !== undefined );
    // can get two arbitrary types. simplify as needed.

    if( type1 instanceof JSHC.TyVar ){
	if( type2 instanceof JSHC.TyVar && type1.id == type2.id ){
	    return; // nothing to add as constraint does nothing
	} else {
	    // type1 is a tyvar while type2 might be
	    this.insertConstraint(type1, type2);
	}
    } else if( type2 instanceof JSHC.TyVar ){
        this.insertConstraint(type2, type1);
    } else if( type1 instanceof JSHC.FunType && type2 instanceof JSHC.FunType ) {
        var t2 = type2.types;
        var t1 = type1.types;
        // put the shortest in 't1'
        if( t2.length < t1.length ){
            var tmp = t2;
            t2 = t1;
            t1 = tmp;
        }
        // make constraints for all types except the last
        for(var ix=0; ix<t1.length-1 ; ix++ ){
            this.constrain(t1[ix], t2[ix]);
        }
        // if same length, then just another constraint
        if( t1.length === t2.length ){
            this.constrain(t1[t1.length-1], t2[t2.length-1]);
        } else {
            var funtype = new JSHC.FunType(t2.slice(t1.length-1));
            this.constrain(t1[t1.length-1],funtype);
        }
    } else if( type1 == JSHC.Check.StarKind && type2 == JSHC.Check.StarKind ) {
        return;
    } else if( type1.toString() == type2.toString() ) {
        return;
    } else {
	throw new JSHC.TypeError(type1, type2);
    }
};
/*
  takes a tyvar and a type that it is equivalent to.
*/
JSHC.Check.Ctx.prototype.insertConstraint = function(tyvar,type1){
   assert.ok( tyvar instanceof JSHC.TyVar );

   if( this.tyvar_ctx[tyvar] !== undefined ){
      // there is a mapping to some "type2"
      // add constraint "type1 = type2"
      this.constrain(type1,this.tyvar_ctx[tyvar]);
   } else {
      // if tyvar does NOT exist in the mapping

      //JSHC.alert("tyvar: ",tyvar,"\ntype: ",type1.toString());

      // simplify type1 using existing constraints.

      //if( type1.name=="forall" ){
      //    JSHC.alert("simplifying: ",type1.toString());
      //}
      type1 = this.simplify(type1);

      // check for occurences of "tyvar" in "type1". if so, fail.
      if( JSHC.Check.isVarInType(tyvar,type1) ){
          throw new JSHC.SourceError(undefined, undefined, "infinite type (1)");
      }

      // insert into constraint mapping
      this.tyvar_ctx[tyvar] = type1;
      
      // eliminate all occurences of "tyvar" in RHSs.
      this.eliminateTyVar(tyvar);
   }
};
/*
   simplify a type using existing constraints.
*/
JSHC.Check.Ctx.prototype.simplify = function(type){
    assert.ok ( type !== undefined );

    switch( type.name ){
    case "tyvar":
        if( this.tyvar_ctx[type] !== undefined ){
            return this.tyvar_ctx[type];
        } else {
            return type;
        }

    case "tycon":
        return type;

    case "starkind":
        return type;

    case "apptype":
        var lhs = this.simplify(type.lhs);
        var rhs = this.simplify(type.rhs);
        return new JSHC.AppType(lhs,rhs);

    case "funtype":
        var ts = [];
        for(var t=0 ; t<type.types.length ; t++){
           ts.push(this.simplify(type.types[t]));
        }
        return new JSHC.FunType(ts);

    case "forall":
        assert.ok( false );

    default:
        throw new Error("unknown type: "+type.name);
    };
};
JSHC.Check.Ctx.prototype.eliminateTyVar = function(tyvar1){
  // look up the RHS of the given tyvar
  var type1 = this.tyvar_ctx[tyvar1];
  var type1_vars = JSHC.Check.computeUsedVars(type1);

  // replace all occurences of the tyvar in the RHSs of the contexts
  for(var ix=0 ; ix<this.contexts.length ; ix++ ){
    var context = this.contexts[ix];
    for(var name in context){
      var type2 = context[name];

      // replace all occurences of 'tyvar1' in 'type2' with 'type1'
      type2 = JSHC.Check.replaceTyVarWith(tyvar1,type1,type2);

      // replace old type with the new type
      context[name] = type2;
    }
  }

  // replace all occurences of the tyvar in the RHSs.
  for(var tyvar2 in this.tyvar_ctx){
    var type2 = this.tyvar_ctx[tyvar2];

    // replace all occurences of 'tyvar1' in 'type2' with 'type1'
    type2 = JSHC.Check.replaceTyVarWith(tyvar1,type1,type2);

    // replace old type with the new type
    this.tyvar_ctx[tyvar2] = type2;

    if( type1_vars[tyvar2] && JSHC.Check.isVarInType(tyvar2,type2) ){
      throw new JSHC.SourceError(undefined, undefined, "infinite type (2)");
    }
  };
};
// can take specified types (signatures) for params
JSHC.Check.Ctx.prototype.add = function(name,type){
    if( type === undefined ){
	type = this.newBoundTyVar();
    }
    //name.type = type;
    this.contexts[this.contexts.length-1][name] = type;
    return type;
};
JSHC.Check.Ctx.prototype.rem = function(name){
    var ctx = this.contexts[this.contexts.length-1];
    assert.ok( ctx[name] !== undefined, "name must exist. trying to delete "+name );
    delete ctx[name];
};
/*
  lookup type and instantiate quantified type variables
*/
JSHC.Check.Ctx.prototype.lookupType = function(comp,name){
   var type = this.lookupAny(comp,name,"type");
   return this.instantiate(type);
};
JSHC.Check.Ctx.prototype.lookupKind = function(comp,name){
   return this.lookupAny(comp,name,"kind");
};

JSHC.Check.Ctx.prototype.lookupAny = function(comp,name,field){
    var ix;
    /*
    var n = this.unresolved[name];
    if( n !== undefined ){
	assert.ok( n !== undefined );
	return n;
    }
    */
    
    // TODO: if name check failed for the name (warning), then the name must
    //       have been marked with a ".bad" member or something so that one can
    //       throw an exception here and skip everything that it depends upon.

    //JSHC.alert("looking up: ",name);

    if( name.loc !== undefined ){
        if( name.loc == "JSHC.Internal.Prelude" ){
            // TODO: should use foreign declarations instead to specify the type.
            var int32_type = new JSHC.TyCon("Int32",{},"Data.Int");
            var iii_type = new JSHC.FunType([int32_type,int32_type,int32_type]);
            if( field == "type" ){
                switch( name.id ){
                case "int32add":
                case "int32sub":
                case "int32mul":
                case "int32div":
                    return iii_type;
                    break;
                }
            }
        }

        //if( name.loc !== "Prelude" ){
        //    JSHC.alert("looking up (qualified): ",name);
        //    for( var xxcm in comp.modules ){
        //        JSHC.alert(xxcm);
        //    }
        //    JSHC.alert(comp.modules[name.loc].ast.espace);
        //}
        var espace = comp.modules[name.loc].ast.espace;
        var expo = espace[name];
        //if( name.loc !== "Prelude" )JSHC.alert("found ",expo);
        var info = espace[name][field];
        if( info === undefined ){
            comp.onError("type information missing for "+name.toStringQ());
        } else {
            return info;
        }
        //JSHC.alert("accessing " + name + " in espace ", comp.modules[name.loc].ast.espace);
        // return JSHC.Check.instantiate(modules[name.loc].espace[name][field]);
    } else {
        // if NOT qualified, then lookup in the lspace.
        //JSHC.alert("type checking. looking up",name," in lspace");

        // look up name in lspace
        for(ix=this.contexts.length-1 ; ix>=0 ; ix--){
	    n = this.contexts[ix][name];
	    if( n !== undefined ){
	        assert.ok( n !== undefined );
	        return n;
	    }
        }
        //JSHC.alert("not found");
    }

    // only possible if error in name check or if continuing after name check
    // anyway.
    throw new JSHC.SourceError(undefined,undefined,name + " not in scope when type checking");
};
JSHC.Check.Ctx.prototype.push = function(){
    //this.contexts.push(opt_list===undefined ? {} : opt_list);
    this.contexts.push({});
    this.tyvars.push({});
};
JSHC.Check.Ctx.prototype.pop = function(){
    var curr_tv = this.tyvars[this.tyvars.length-1];
    var curr_ctx = this.contexts[this.contexts.length-1];

    var remaining = [];
    for(var k in curr_ctx ){
	var used_vars = JSHC.Check.computeUsedVars(curr_ctx[k]);
	for(var v in used_vars){
	    if( curr_tv[v] ){
		remaining.push(v);
	    }
	}
    }

    assert.ok( remaining.length === 0, "remaining type variables: "+remaining );

    this.contexts.pop();
    this.tyvars.pop();
};

////////////////////////////////////////////////////////////////////////////////

/*
  generator for new unique type variables
*/
JSHC.Check.Freevars = function(){
    this.amount = 0;
};
JSHC.Check.Freevars.prototype.next = function(){
    return new JSHC.TyVar("'t"+(++this.amount));
};

////////////////////////////////////////////////////////////////////////////////

/*
  find all occurences of 'tyvar' in 'type' and replace them with 'rtype',
  and then return the new type.
*/
JSHC.Check.replaceTyVarWith = function(tyvar,rtype,type){
    assert.ok ( type !== undefined );

    var replace = function(type){
	switch( type.name ){
	case "tyvar":
	    if( type == tyvar ){
	        return rtype;
	    } else {
	        return type;
	    }

	case "forall":
	    assert.ok( false );
	    return type;

        case "apptype":
            var lhs = replace(type.lhs);
            var rhs = replace(type.rhs);
            return new JSHC.AppType(lhs,rhs);

        case "funtype":
            var ts = [];
            for(var t=0 ; t<type.types.length ; t++){
               ts.push(replace(type.types[t]));
            }
            return new JSHC.FunType(ts);

	case "tycon":
	    return type;

        case "starkind":
            return type;

	default:
	    throw new Error("unknown type: "+type.name);
	};
    };

    return replace(type);
};

/*
  find all occurences of 'tyvar' in 'type' and replace them with 'rtype',
  and then return the new type.
*/
JSHC.Check.replaceTyVars = function(mapping,type){
    assert.ok ( type !== undefined );

    var replace = function(type){
	switch( type.name ){
	case "tyvar":
	    if( mapping[type] !== undefined ){
	        return mapping[type];
	    } else {
	        return type;
	    }

	case "forall":
	    assert.ok( false );
	    return type;

        case "apptype":
            var lhs = replace(type.lhs);
            var rhs = replace(type.rhs);
            return new JSHC.AppType(lhs,rhs);

        case "funtype":
            var ts = [];
            for(var t=0 ; t<type.types.length ; t++){
               ts.push(replace(type.types[t]));
            }
            return new JSHC.FunType(ts);

	case "tycon":
	    return type;

        case "starkind":
            return type;

	default:
	    throw new Error("unknown type: "+type.name);
	};
    };

    return replace(type);
};

/*
  returns true if and only if the tyvar occurs in the type
*/
JSHC.Check.isVarInType = function(tyvar,type){
  // simple inefficient implementation
  return JSHC.Check.computeUsedVars(type)[tyvar] !== undefined;
};

/*
   return a set with all tyvars that occur in the type
*/
JSHC.Check.computeUsedVars = function(type){
    assert.ok ( type !== undefined );
    var tvs = {};

    var find = function(type,binds){
	switch( type.name ){
	case "tyvar":
	    if( binds === undefined || binds[type.id] === undefined ){
                tvs[type.id] = type;
	    }
	    break;

	case "forall":
	    assert.ok(binds === undefined);
	    find(type.type,type.binds);
	    break;

	case "funtype":
            for(var t=0 ; t<type.types.length ; t++){
	        find(type.types[t]);
	    }
	    break;

        case "apptype":
	    find(type.lhs);
	    find(type.rhs);
	    break;

        case "starkind":
            break;

	case "tycon":
	    break;

	default:
	    throw new Error("unknown type: "+type.name);
	};
    };

    find(type);
    return tvs;
};

/*
  replace all kind variables with "*"
*/
JSHC.Check.kindify = function(type){
    assert.ok ( type !== undefined );

    var replace = function(type){
	switch( type.name ){
	case "tyvar":
            return JSHC.Check.StarKind;

	case "forall":
	    assert.ok( false );
	    return type;

        case "funtype":
            var ts = [];
            for(var t=0 ; t<type.types.length ; t++){
               ts.push(replace(type.types[t]));
            }
            return new JSHC.FunType(ts);

	case "tycon":
	    return type;
	
	case "starkind":
	    return type;

	default:
	    throw new Error("unknown type: "+type.name);
	};
    };

    return replace(type);
};

JSHC.Check.StarKind = {
    name: "starkind",
    toString: function(){
        return "*";
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  Return a set with all used qualified names that occur in the expression.
*/
JSHC.Check.computeUsedQualifiedNames = function(ast){

    var names = {};

    var find = function(ast){
	switch( ast.name ){

        case "topdecl-data":
            var constrs = ast.constrs;
            for(var i=0 ; i<constrs.length ; i++){
                var types = constrs[i].types;
                for(var j=0 ; j<types.length ; j++){
                    find(types[j]);
                }
            }
            break;

        case "application":
            var exps = ast.exps;
            for(var i=0 ; i<exps.length ; i++){
                find(exps[i]);
            }
            break;

        case "conpat":
            var pats = ast.pats;
            for(var i = 0; i < pats.length; i++){
                find(pats[i]);
            }
            break;

        case "tuple_pat":
            var mems = ast.members;
            for(var i = 0; i < mems.length; i++){
                find(mems[i]);
            }
            break;    

        case "apptype":
            find(ast.lhs);
            find(ast.rhs);
            break;
        
        case "tyvar":
        case "integer-lit":
        case "fixity":
            // nothing to add.
            break;

        case "topdecl-decl":
            find(ast.decl);
            break;

        case "decl-fun":
            ast.args.forEach(function(a){find(a)});
            find(ast.rhs);
            break;

        case "dacon":
        case "tycon":
        case "varname":
            names[ast] = ast;
            break;

	default:
            throw new JSHC.CompilerError("missing case: "+ast.name);
	};
    };

    find(ast);
    return names;
};

////////////////////////////////////////////////////////////////////////////////

/*
  Return a set with all declared qualified names that occur in the expression.
*/
JSHC.Check.computeDeclaredQualifiedNames = function(ast){

    var names = {};

    var find = function(ast){
	switch( ast.name ){

        case "topdecl-data":
            names[ast.typ.tycon] = ast.typ.tycon;
            var constrs = ast.constrs;
            for(var i=0 ; i<constrs.length ; i++){
                var dacon = constrs[i].dacon;
                names[dacon] = dacon;
            }
            break;

        case "topdecl-decl":
            find(ast.decl);
            break;

        case "decl-fun":
            names[ast.ident] = ast.ident;
            break;
            
        case "fixity":
            //no typechecking needs to be done for fixity declarations
            break;

	default:
            throw new JSHC.CompilerError("missing case: "+ast.name);
	};
    };

    find(ast);
    return names;
};

////////////////////////////////////////////////////////////////////////////////

/*
  Remove the
*/
JSHC.Check.Ctx.prototype.instantiate = function(ast){
    // should not be any quantification within types, only at the top.
    if( ast.name !== "forall" ){
        return ast;
    }

    var ctx = this;
    var boundVars = {};
    for(var b in ast.binds){
        boundVars[b] = ctx.newUnboundTyVar();
    }

    var replace = function(ast){
	switch( ast.name ){
	case "apptype":
	   var lhs = replace(ast.lhs);
	   var rhs = replace(ast.rhs);
	   return new JSHC.AppType(lhs,rhs);

	case "tycon":
	    return ast;

	case "funtype":
            var ts = [];
            for(var t=0 ; t<ast.types.length ; t++){
               ts.push(replace(ast.types[t]));
            }
            return new JSHC.FunType(ts);

        case "tyvar":
            if( boundVars[ast] !== undefined ){
                return boundVars[ast];
            } else {
                return ast;
            }

	default:
            throw new JSHC.CompilerError("missing case: "+ast.name);
	};
    };

    var newtype = replace(ast.type);
    //JSHC.alert("instantiated ",ast.toString()," into ",newtype.toString());
    return newtype;
};

////////////////////////////////////////////////////////////////////////////////
