JSHC.Compile = {};

//TODO: include all checking and fixity and stuff!

JSHC.Compile.compile = function (input) {
    var res = JSHC.parse(input);
    JSHC.Check.fixityResolution(res);
    JSHC.Simplify.simplify(res);
    return JSHC.Codegen.codegen(res);
}

JSHC.Compile.compileExp = function (input) {
    var res = JSHC.parseExp(input);
    JSHC.Fixity.fixityResolution(res);
    JSHC.Simplify.simplify(res);
    return JSHC.Codegen.codegen(res);
}
