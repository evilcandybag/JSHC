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
    
    var comSoloExp = function(exp) {
        return comExp(exp);
    }

    var comBody = function(body) {
        if (body.name !== "body") 
            throw new Error("Module body is not of type body, but " + body.name);
            
        var res = ""
        for (var i = 0; i < body.topdecls.length; i++) {
            switch (body.topdecls[i].name) {
                case "topdecl-decl":
                    res += comDecl(body.topdecls[i].decl) + ";\n";
                    break;
                case "topdecl-data":
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
                
                res = (modid + "[\"" + decl.ident.id + "\"]" + " = "  + comRhs(decl.rhs));
                break;
            default:
                throw new Error("comDecl not defined for name " + decl.name);
        }
        return res;
        
    }

    var comRhs = function(rhs) {

        return "function() {return " + comExp(rhs) + "}";
    }

    var comExp = function(exp) {

        var res = "";
        switch (exp.name) {
            case "constrained-exp":
                throw new Error("comExp not defined for name " + exp.name);
                break;
            case "infixexp":
                res += comInfixexp(exp.exps);
                break;
            case "application":
            case "lambda":
            case "dacon":
            case "varname":
            case "integer-lit":
            case "case":
//                alert("compiling expression:\n\n " + JSHC.showAST(exp));
                res += comInfixexp([exp]);
                break;
            default: 
                throw new Error("comExp not defined for name " + JSHC.showAST(exp));
        }
        return res;
    }

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

    var comApat = function(apat) {

        var res = "";
        switch (apat.name) {
            case "varname":
//            case "var-op":
                res += apat.id;
                break;
            default:
                throw new Error("comApat not defined for name " + apat.name); 
        }
        return res;
        
    }

    
    var comInfixexp = function(exp) {

        var res = "";
        for (var i = 0; i < exp.length; i++) {
            switch (exp[i].name) {
             case "application":
//                alert("compiling application of:\n " + JSHC.showAST(exp[i].exps));
                res += comFexp(exp[i].exps);
                break;
             case "varname":
             case "integer-lit":
             case "dacon":
                res += comFexp([exp[i]]);
                break;
             case "lambda":
                res += comLambda(exp[i]);
                break;
             case "case":
//                alert("comCase:\n\n" + JSHC.showAST(exp[i]))
                res += comCase(exp[i]);
                break;
             default:
                throw new Error("comInfixexp not defined for name " + exp[i].name); 
            }
        }
        return res;
        
    }

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

    var comLambda = function(lamb){
        
        if (lamb.atArg === undefined) {
            lamb.atArg = 0;
            lamb.arglen = lamb.args.length
        }
        
        var res = "";
        if (lamb.atArg < lamb.arglen) {
            var arg = lamb.args[lamb.atArg];
            lamb.atArg++;
            res += "function(" + comApat(arg) + "){ return " + comLambda(lamb) + "}"
        } else {
            res +=  comExp(lamb.rhs);
        }
        return res;
    }

    var comCase = function(cas) {

        var ex = comExp(cas.exp)
//        alert("COMPILED: \n" + JSHC.showAST(cas.exp) + "to:\n" + JSHC.showAST(ex))
        var res = "JSHC.Internal.match(" + ex + ", [\n";
        for (var i = 0; i < cas.alts.length; i++) {
            var binds = JSHC.comUtils.getBinds(ex, cas.alts[i].pat);
            var bindStrs = JSHC.comUtils.getBindStrs(cas.alts[i].pat);
            res += "{p: " + comCasePat(cas.alts[i].pat) + ",";//+ "{name: \"" + cas.alts[i].pat.name + "\", "
//            res +=            "p: " + comPat(cas.alts[i].pat) + "},";
//            res += "b: [" + binds.join(",") + "],"; 
            res += "f: function(" + bindStrs.join(","); 
            res += "){return " + comExp(cas.alts[i].exp) + "}},\n";             
        }
        res += "])\n"
        return res;
    }

    var comCasePat = function(pat) {

        var res = "";
        switch (pat.name) {
            case "dacon":
                res += "[\"" + pat.id  + "\"]";
                break;
            case "conpat":
                res += "[\"" + pat.con.id + "\","
                for (var i = 0; i < pat.pats.length; i++) {
                    res += comCasePat(pat.pats[i]) + ", ";
                }
                res += "]"
                break;
            case "tuple_pat":
                res += "[" 
                for (var i = 0; i < pat.members.length; i++) {
                    res += comCasePat(pat.members[i]) + ", ";
                }
                res += "]"
                break;
            case "varname":
                res += "\"" + pat.id + "\""
                break;
            case "integer-lit":
                res += pat.value;
                break;
            default:
                throw new Error("comCasePat not defined for name " + pat.name);
        }
        return "{name: \"" + pat.name + "\", p: " + res + "}";
    }
    
    var comFname = function(exp) {

        var res = "";
        switch (exp.name) {
            case "varname":
                if (exp.loc !== undefined) {
                    var x = JSHC.comUtils.splitQvarid(exp.id);
                    var r = exp.loc;
                    r = r.substr(0, r.length-1);
                    res += namespace + "." + r + "[\"" + x.i + "\"]";
                    break;
                } else {
                    res += exp.id ;
                    break;
                }
            default:
                throw new Error("comFname not defined for name " + exp.name);
        }
        return res;
    }
    
    var comAexp = function(exp, strict) {
        
        var res = "";
        switch (exp.name) {
            case "dacon":
                res += "[\"" + exp.id + "\"]"
                break; 
            case "varname":
                if (exp.loc !== undefined) {
//                    var x = exp.id.substr(exp.loc.length);
                    var x = exp.id.substr(exp.id.lastIndexOf(".")+1);
                    var r = exp.loc
//                    r = r.substr(0, r.length-1);
                    res += (strict)? "" : "JSHC.TC(function(){return ";
                    //filter out references to our internal libraries
                    if (r.substr(0,13) === "JSHC.Internal")
                        res += r + "[\"" + x + "\"]()";
                    else
                        res += namespace + "." + r + "[\"" + x + "\"]()";
                    res += (strict)? "" : "})"; 
                    break;
                } else {
                    if (strict) 
                        res += exp.id;
                    else
                        res += "JSHC.TC(function() {return " + exp.id + "})";
                    break;
                }
            case "integer-lit":
                res += exp.value;
                break;
            case "infixexp":
            case "application":
                res += comExp(exp);
                break;
            case "tuple":
                res += "[";
//                alert("TUPLE MEMBERS: " + JSHC.showAST(exp.members))
                for (var i = 0; i < exp.members.length; i++) {
                    res += comExp(exp.members[i])
                    if (i !== exp.members.length-1)
                        res += " , "
                }
                res += "]"
                break;
            default:
                throw new Error("comAexp not defined for name " + exp.name);
        }
        return res;
    }


    if (input.name === "infixexp" || input.name === "application" ||
        input.name === "varname" || input.name === "dacon" ||
        input.name === "integer-lit" || input.name === "case" ||
        input.name === "lambda")
        return comSoloExp(input);
    else
        return comModule(input);
    
}
