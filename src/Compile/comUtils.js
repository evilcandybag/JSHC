JSHC.comUtils = new Object();
JSHC.Compiler = new Object();

//used to separate the qualifier part from a qvarid
JSHC.comUtils.splitQvarid = function(input) {
    var q, i;
    
    i = input.substr(input.lastIndexOf(".")+1);
    q = input.slice(0,input.lastIndexOf("."));

    return {i: i, q: q}
    
}

JSHC.comUtils.getBinds = function(exp, pat) {
    
    var res = []
    switch (pat.name) {
    case "conpat":
        for (var i = 0; i < pat.pats.length; i++) {
            res.push(pat.pats[i].id);
        }   
        break;
    case "tuple_pat":
        for (var i = 0; i < pat.members.length; i++) {
            res.push(pat.members[i].id);
        }
    case "varname":
        res.push(exp);
        break;
    case "dacon":
        break;
    default:
        throw new Error ("illegal pattern in getBinds: " + pat.name)
    }
    return res;
}

JSHC.comUtils.getBindStrs = function(p) {

    var res = []
    
    var inner = function (pat) {
        switch (pat.name) {
        case "conpat":
            for (var i = 0; i < pat.pats.length; i++) {
                inner(pat.pats[i]);
            }
            break;
        case "tuple_pat":
            for (var i = 0; i < pat.members.length; i++) {
                inner(pat.members[i]);
            }
            break;
        case "varname":
            res.push(pat.id);
            break;
        case "dacon":
        case "integer-lit":
            break;
        default:
            throw new Error ("illegal pattern in getBinds: " + pat.name)
        }
    }
    inner(p);
    return res;
   
}
