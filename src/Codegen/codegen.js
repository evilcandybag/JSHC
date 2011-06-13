//require utility.js
//        Internal.lazy.js
//        Compile.comUtils

JSHC.Codegen.codegen = function (input,namespace) {
    if (namespace === undefined)
        namespace = "modules";
    assert.ok(typeof namespace === "string", "The supplied namespace must be of type String!");
    
//    try {
//    alert("ATTEMPTING COMPILATION OF AST: \n\n" + JSHC.showAST(input));
//    } catch (err) {
//        alert(JSHC.showError(err));
//    }
    var modid;
    
    var comModule = function(module) {
        if (module.name !== "module") 
           throw new Error("Top level node in AST is not a module, but a " + module.name);
           
        modid = namespace + "." + ((module.modid) ? module.modid.id : "Main");
//        if (module.exports) {
//           throw new Error ("compilation of exports not defined!");
//        }
        var res = "";
        JSHC.ModName.prefixes(module.modid.id).forEach(function(prefix){
            res += "if( "+namespace+"."+prefix+" === undefined ){ "+
                   namespace+"."+prefix+" = new Object(); }\n";
        });
        res += comBody(module.body);
        return res;
    }

    /*
        compiles into lazy expression
    */
    var comSoloExp = function(exp) {
        var code = comExp(exp);
        if( code[0] ){
            return "new JSHC.Thunk("+code[1]+")";
        } else {
            return code[1];
        }
    }

    var comBody = function(body) {
        if (body.name !== "body") 
            throw new Error("Module body is not of type body, but " + body.name);
            
        var res = ""
        for (var i = 0; i < body.topdecls.length; i++) {
            switch (body.topdecls[i].name) {
                case "topdecl-decl":
                    res += comDecl(body.topdecls[i].decl);
                    break;
                case "topdecl-data":
                    res += comData(body.topdecls[i]);
                    break;
                default:
                    throw new Error("comBody not defined for name " + body.topdecls[i].name);
            }
        }
        return res;
        
    }

    var comDecl = function(decl) {
        var res = ""
        switch (decl.name) {
            case "decl-fun":
                res = (modid + "[\"" + decl.ident.id + "\"]" + " = " + comRhs(decl.rhs)) + ";\n";
                break;
            default:
                throw new Error("comDecl not defined for name " + decl.name);
        }

        if( typeof res != "string" ){
            JSHC.alert("compiling\n",decl);
            JSHC.alert("to\n",res);
            throw new Error("stop");
        }

        return res;
    }

    var comRhs = function(rhs) {
       // not necessary for all RHSs to be lazy, but must avoid evaluating
       // the RHS when using global names that have no yet been defined outside
       // functions in the RHS.
       var code = comExp(rhs);
       //if( code[0] ){
       //    code = "new JSHC.Thunk("+code[1]+")";
       return "new JSHC.Thunk(function() {return " + code[1] + "})";
       //} else {
       //    code = code[1];
       //}
       //return "function(){" + code + "}"
    }

    var comExp = function(exp) {
        switch (exp.name) {
             case "application":
//                alert("compiling application of:\n " + JSHC.showAST(exp[i].exps));
                return comExpApp(exp);

             case "integer-lit":
                return comExpLit(exp);

             case "varname":
             case "dacon":
                return comExpName(exp);

             case "tuple":
                return comExpTuple(exp);

             case "lambda":
                return comExpLambda(exp);

             case "case":
//                alert("comCase:\n\n" + JSHC.showAST(exp[i]))
                return comExpCase(exp);
             case "let":
             case "fun-where":
             	//JSHC.alert("compilING:", exp);
             	var res = comExpDecls(exp);
             	//JSHC.alert("compiled:", res);
             	return res;
             default:
                throw new Error("comExp not defined for name " + JSHC.showAST(exp));
        }
    }

/*
    var comPat = function(pat) {

        var res = "";
        switch (pat.name) {
            case "dacon":
                res += "[\"" + pat.id  + "\"]";
                break;
            case "conpat":
                res += "[\"" + pat.con.id + "\","
                for (var i = 0; i < pat.pats.length; i++) {
                    res += comPat(pat.pats[i]) + ", ";
                }
                res += "]"
                break;
            case "varname":
                res += "\"" + pat.id + "\""
                break;
            default:
                throw new Error("comPat not defined for name " + pat.name);
        }
        return res;
    }
*/

    var comApat = function(apat) {

        var res = "";
        switch (apat.name) {
            case "varname":
//            case "var-op":
                res += apat.id;
                break;
            default:
                JSHC.alert("When compiling: \n\n", input)
                throw new Error("comApat not defined for name " + apat.name); 
        }
        return res;
        
    }

/*
    var comFexp = function(exp) {
        
        var res = "";
        switch (exp[0].name) {
            case "dacon":
                res += "[\"" + exp[0].id + "\"";
                for (var i = 1; i < exp.length; i++) {
                    res += ", " + comAexp(exp[i]);
                }
                res += "]"
                break;
            default:
                res += comAexp(exp[0],true);
                for (var i = 1; i < exp.length; i++) {
                    res += "(" + comAexp(exp[i]) + ")";
                }
//                res += ")";
                break;
        }
        return res;
    }
*/

    var comExpCase = function(cas) {
        // does not matter if case gets a strict or lazy value
        var ex_code = comExp(cas.exp)[1];
		assert.ok(typeof ex_code === "string" );
        var res = "";
        res += "new JSHC.Thunk(function(){return ";

//        alert("COMPILED: \n" + JSHC.showAST(cas.exp) + "to:\n" + JSHC.showAST(ex))
        res += "JSHC.Internal.match(" + ex_code + ", [\n";
        for (var i = 0; i < cas.alts.length; i++) {
            var bindStrs = JSHC.comUtils.getBindStrs(cas.alts[i].pat);
            res += "{p: " + comCasePat(cas.alts[i].pat) + ",";
            res += "f: function(" + bindStrs.join(",");
            var rhs_code = comExp(cas.alts[i].exp);
            if( rhs_code[0] ){
                rhs_code = "new JSHC.Thunk(" + rhs_code[1] + ")";
            } else {
                rhs_code = rhs_code[1];
            }
            res += "){return " + rhs_code + "}},\n";
        }
        res += "])";
        res += "})\n";  // end of creation of thunk
        //JSHC.alert("case result\n",cas.exp,"\n\n",ex_code,"\n\n",res);
        return [false,res];
    }

    var comCasePat = function(pat) {

        var res = "";
        switch (pat.name) {
            case "dacon":
                res += "new JSHC.Internal.ConPat(\""+pat.id+"\",[])";
                break;
            case "conpat":
                res += "new JSHC.Internal.ConPat(\""+pat.con.id+"\",[";
                for (var i = 0; i < pat.pats.length; i++) {
                    res += comCasePat(pat.pats[i]) + ", ";
                }
                res += "])"
                break;
            case "tuple_pat":
                res += "new JSHC.Internal.TuplePat(["
                for (var i = 0; i < pat.members.length; i++) {
                    res += comCasePat(pat.members[i]) + ", ";
                }
                res += "])"
                break;
            case "varname":
                res += "new JSHC.Internal.NamePat(\"" + pat.id + "\")";
                break;
            case "integer-lit":
                res += "new JSHC.Internal.IntegerPat("+pat.value+")";
                break;
            case "wildcard":
                res += "new JSHC.Internal.WildPat()";
                break;
            default:
                throw new Error("comCasePat not defined for name " + pat.name);
        }
        return res;
    }

    var comData = function(type){
        if( type.constrs.length == 0 ){
            return "";  // empty datatype, so no code needed
        }
        var buf = [];
        buf.push(modid+"[\":"+type.typ.tycon+"\"] = function(dacon,args){\n");
        buf.push("    assert.ok(typeof dacon == \"string\");\n");
        buf.push("    assert.ok(args instanceof Array);\n");
        buf.push("    this.dacon = dacon;\n");
        buf.push("    this.args = args;\n");
        buf.push("};\n");
        buf.push(modid+"[\":"+type.typ.tycon+"\"].prototype = new JSHC.Internal.Datatype();\n");

        for(var ix=0 ; ix<type.constrs.length ; ix++){
            var dacon = type.constrs[ix].dacon;
            var N = type.constrs[ix].types.length;

            buf.push(modid+"[\""+dacon+"\"] = ");

            for(var jx=0 ; jx<N ; jx++){
                buf.push("function(a"+jx+"){return ");
            }

            buf.push("new JSHC.Thunk(new "+modid+"[\":"+type.typ.tycon+"\"](\""+dacon+"\",[");
            if( N > 0 ){
                for(var jx=0 ; jx<N ; jx++){
                    buf.push("a"+jx);
                    buf.push(",");
                }
                buf.pop();   // remove last ",".
            }
            buf.push("]))");

            for(var jx=0 ; jx<N ; jx++){
                buf.push("}");
            }
            buf.push("\n");
        }
        //JSHC.alert("datatype code\n",buf.join(""));
        return buf.join("");
    };

    var comExpTuple = function(tuple){
        var buf = [];
        buf.push("new JSHC.Internal.Types[\"()\"]([");
        for(var ix=0 ; ix<tuple.members.length ; ix++){
            var exp_code = comExp(tuple.members[ix]);
            if( exp_code[0] ){
                // all params of the tuple constructor need to be thunks.
                buf.push("new JSHC.Thunk("+exp_code[1]+")");
            } else {
                buf.push(exp_code[1]);
            }
            buf.push(",");
        }
        buf.pop();
        buf.push("])");
        return [true,buf.join("")];
    };

    /*
       function application expression
    */
    var comExpApp = function(app){
        assert.ok(app.exps.length > 1);

        var buf = [];
        buf.push("new JSHC.Thunk(function(){return ");

        var fun = comExp(app.exps[0]);
        buf.push(fun[1]);

        // if lazy, then evaluate it to get the function to use.
        if( !fun[0] ){
            buf.push(".v");
        }

        for(var ix=1 ; ix<app.exps.length ; ix++){
            var arg = comExp(app.exps[ix]);
            buf.push("(");
            //JSHC.alert("compiling\n",app.exps[ix],"\n",arg);
            if( arg[0] ){
                buf.push("new JSHC.Thunk("+arg[1]+")");
            } else {
                buf.push(arg[1]);
            }
            buf.push(")");
        }
        buf.push("})");
        return [false,buf.join("")];
    };

    /*
        wrap internal names with params into a curried (lazy) function and then
        add a thunk that evaluates all argument thunks and then calls the strict
        function
        if no params, then just add a thunk.
    */
    var comExpInternal = function(name){
        if( ! (eval(name) instanceof Function) ){
            throw new Error("compilation: missing internal name");
        }

        var types;
        switch( name ){
        case "JSHC.Internal.int32add":
        case "JSHC.Internal.int32sub":
        case "JSHC.Internal.int32mul":
        case "JSHC.Internal.int32div":
        case "JSHC.Internal.int32max":
        case "JSHC.Internal.int32min":
          types = ["Int32","Int32","Int32"];
          break;

        case "JSHC.Internal.int32negate":
        case "JSHC.Internal.int32abs":
        case "JSHC.Internal.int32signum":
          types = ["Int32","Int32"];
          break;

        case "JSHC.Internal.int32eq":
        case "JSHC.Internal.int32lt":
        case "JSHC.Internal.int32gt":
        case "JSHC.Internal.int32le":
        case "JSHC.Internal.int32ge":
        case "JSHC.Internal.int32eq":
        case "JSHC.Internal.int32ne":
          types = ["Int32","Int32","Bool"];
          break;

        case "JSHC.Internal.seq":
          types = ["any","any","any"];
          break;

        case "JSHC.Internal.undefined":
          types = ["any"];
          break;

        default:
          throw new Error("missing case for: "+name);
        }

        var N = eval(name+".length");
        assert.ok(typeof N == "number", typeof N);
        assert.ok(N == types.length-1, N + " != " + types.length-1);

        if( N === 0 ){
            // wrap foreign function (with no params) to be evaluated.
            return [false,"new JSHC.Thunk("+name+")"];
        }

        var buf = [];
        for(var ix=0 ; ix<N ; ix++){
            buf.push("function(a"+ix+"){return ");
        }

        buf.push("new JSHC.Thunk(function(){return "+name+"(");
        for(var ix=0 ; ix<N ; ix++){

            switch( types[ix] ){
            case "Int32": case "Char": case "any":
              // do nothing, since same representation in Haskell and JavaScript.
              buf.push("a"+ix+".v");
              break;
            case "[Char]":
              buf.push("JSHC.Internal.HSString_to_JSString(a"+ix+")");
              break;
            default:
              throw new Error("missing case");
            }

            buf.push(",");
        }
        buf.pop();   // remove last ",".
        buf.push(")");

        // if the result is a boolean, then create a True/False haskell value.
        switch( types[types.length-1] ){
        case "Bool":
            buf.push(" ? "+namespace+".Prelude.True.v : "+namespace+".Prelude.False.v");
            break;
        case "Int32": case "Char": case "any":
            break;
        default:
            throw new Error("missing case");
        }
        buf.push("})");  // end argument to JSHC.Thunk

        for(var ix=0 ; ix<N ; ix++){
            buf.push("}");
        }

        //JSHC.alert("comExpInternal\n",buf.join(""));
        //throw new Error("comExpInternal");
        return [true,buf.join("")];
    };

    /*
        read qualified names from the namespace.
        wrap internal names.
    */
    var comExpName = function(exp){
        if( exp.loc === undefined ){
            if( exp.id == "[]" ){
                return [true,"JSHC.Internal.Types[\"[].[]\"]"];
            } else if( exp.id == ":" ){
                return [true,"JSHC.Internal.Types[\"[].:\"]"];
            } else {
                return [false,exp.toString()];
            }
        } else {
//                    var x = exp.id.substr(exp.loc.length);
            //var x = exp.id.substr(exp.id.lastIndexOf(".")+1);
            var x = exp.id;
//                    r = r.substr(0, r.length-1);
            //res += "new JSHC.Thunk(function(){return ";
                    //filter out references to our internal libraries
            if (exp.loc.substr(0,13) === "JSHC.Internal") {
                return comExpInternal(exp.loc + "." + x);
            } else if ( exp instanceof JSHC.DaCon ) {
                return [true,namespace + "." + exp.loc + "[\"" + x + "\"]"];
            } else {
                assert.ok( x.length !== 0 );
                return [false,namespace + "." + exp.loc + "[\"" + x + "\"]"];
            }
        }
    };
    
    var comExpDecls = function(exp) {
    	var res = "";
    	res += " function() {\n"
    	for (var i = 0; i < exp.decls.length; i++) {
    		res += comLocalDecl(exp.decls[i]);
    	}
    	res += "return " + comExp(exp.exp)[1] + ";}();";
    	return [false, res];	
    };
    
    var comLocalDecl = function(decl) {
        var res = "";
        switch (decl.name) {
            case "decl-fun":
                res = "var " + (decl.ident.toString() + " = " + comRhs(decl.rhs)) + ";\n";
                break;
            default:
                throw new Error("comLocalDecl not defined for name " + decl.name);
        }

        if( typeof res != "string" ){
            JSHC.alert("compiling\n",decl);
            JSHC.alert("to\n",res);
            throw new Error("stop");
        }

        return res;
    }
    var comExpLambda = function(lamb){
        if (lamb.atArg === undefined) {
            lamb.atArg = 0;
            lamb.arglen = lamb.args.length
        }
        var res = "";
        if (lamb.atArg < lamb.arglen) {
            var arg = lamb.args[lamb.atArg];
            lamb.atArg++;
            res += "function(" + comApat(arg) + "){ return " + comExpLambda(lamb)[1] + "}"
        } else {
            var rhs_code = comExp(lamb.rhs);
            if( rhs_code[0] ){
                res += "new JSHC.Thunk(" + rhs_code[1] + ")";
            } else {
                res += rhs_code[1];
            }
        }
        return [true,res];
    };

    var comExpLit = function(exp){
        assert.ok( exp.name == "integer-lit" );
        //return "new JSHC.Thunk("+exp.value+")";
        return [true,""+exp.value];
    };

    if (input.name === "application" ||
        input.name === "varname" || input.name === "dacon" ||
        input.name === "integer-lit" || input.name === "case" ||
        input.name === "lambda")
        return comSoloExp(input);
    else
        return comModule(input);
    
}
