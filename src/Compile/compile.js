//require utility.js
//        Internal.lazy.js
//        Compile.comUtils

JSHC.Compiler.compile = function (input) {

    var modid
    
    var comModule = function(module) {
        if (module.name !== "module") 
           throw new Error("Top level node in AST is not a module, but a " + module.name);
           
        modid = "modules." + ((module.modid) ? module.modid.id : "Main");
        if (module.exports) {
           throw new Error ("compilation of exports not defined!");
        }
        var res = (modid + " = new Object();\n")
        res += comBody(module.body);
        return res

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
                res = (comFunlhs(decl.lhs) + comRhs(decl.rhs));
                break;
            default:
                throw new Error("comDecl not defined for name " + decl.name);
        }
        return res;
        
    }

    var comFunlhs = function(lhs) {
        
        var id = lhs.ident.id;
        var args = "";
        for (var i = 0; i < lhs.args.length-1; i++) {
            args += comApat(lhs.args[i]) + ",";
        }
//        args += comApat(lhs.args[lhs.args.length-1]);
        return modid + "[\"" + id + "\"]" + " = ";
        
    }

    var comRhs = function(rhs) {

        return comExp(rhs);
    }

    var comExp = function(exp) {

        var res = "";
        switch (exp.name) {
            case "untyped-exp":
                res += comInfixexp(exp.infixexp);
            break;
        }
        return res;
    }

    var comPat = function(pat) {

        var res = "";
        switch (pat.name) {
            case "con":
                res += "[\"" + pat.id  + "\"]";
                break;
            case "conpat":
                res += "[\"" + pat.con.id + "\","
                for (var i = 0; i < pat.pats.length; i++) {
                    res += "\"" + pat.pats[i].id + "\","
                }
                res += "]"
                break;
            case "var":
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
            case "var":
            case "var-op":
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
             case "fexp":
                res += comFexp(exp[i].exps);
                break;
             case "lambda":
                res += comLambda(exp[i]);
                break;
             case "case":
                res += comCase(exp[i]);
                break;
             case "integer-lit":
                res += exp.value
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
            case "var":
            case "qvar":
                res += comFname(exp[0]);
                for (var i = 1; i < exp.length; i++) {
                    res += "(" + comAexp(exp[i]) + ")";
                }
                break; 
            case "integer-lit":
                res += comAexp(exp[0]);
                break;
            default:
                throw new Error("comFexp not defined for name: " + exp[0].name);
        }
        return res;
    }

    var comLambda = function(lamb){

        var res = "";
        if (lamb.args.length > 0) {
            var arg = lamb.args.shift();
            res += "function(" + comApat(arg) + "){ return " + comLambda(lamb) + "}"
        } else {
            res +=  comExp(lamb.rhs);
        }
        return res
    }

    var comCase = function(cas) {

        var res = "JSHC.internal.match(comExp(cas.alts[i]) , [\n";
        for (var i = 0; i < cas.alts.length; i++) {
            res += "{p: " + comPat(cas.alts[i].pat) + ",";
            res += "f: function(" + JSHC.comUtils.getBinds(cas.alts[i].pat).join(","); 
            res += "){return " + comExp(cas.alts[i].exp) + "}},\n";             
        }
        res += "])\n"
        return res;
    }

    var comCaseBinds = function(binds) {

        var res = "";
        switch (binds.name) {
            case "var":
                res += "var " + binds.id + " = " + ""
        }
    }
    
    var comFname = function(exp) {

        var res = "";
        switch (exp.name) {
//            case "var-op":
            case "var":
                res += exp.id;
                break;
            case "qvar":
                var r = JSHC.comUtils.splitQvarid(exp.id);
                res += "modules." + r.q + "[\"" + r.i + "\"]";
                break;
            default:
                throw new Error("comFname not defined for name " + exp.name);
        }
        return res;
    }
    
    var comAexp = function(exp) {

        var res = "";
        switch (exp.name) {
//            case "var-op":
            case "var":
                res += exp.id;
                break;
            case "qvar":
                var r = JSHC.comUtils.splitQvarid(exp.id);
                res += r.q + "[\"" + r.i + "\"]";
                break;
            case "integer-lit":
                res += exp.value
                break;
            default:
                throw new Error("comAexp not defined for name " + exp.name);
        }
        return res;
    }


    
    return comModule(input);
    
}
