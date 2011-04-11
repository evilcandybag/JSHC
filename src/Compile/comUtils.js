JSHC.comUtils = new Object();
JSHC.Compiler = new Object();

//used to separate the qualifier part from a qvarid
JSHC.comUtils.splitQvarid = function(input) {
    var q, i;
    
    i = input.substr(input.lastIndexOf(".")+1);
    q = input.slice(0,input.lastIndexOf("."));

    return {i: i, q: q}
    
}

JSHC.comUtils.getBinds = function(pat) {
    
    var res = []
    switch (pat.name) {
    case "conpat":
        for (var i = 0; i < pat.pats.length; i++) {
            res.push(pat.pats[i].id);
        }
        break;
    case "var":
        res.push(pat.id);
        break;
    case "con":
        break;
    default:
        throw new Error ("illegal pattern in getBinds: " + pat.name)
    }
    return res;
}
