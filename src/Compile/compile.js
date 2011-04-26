JSHC.Compile = {};

//TODO: include all checking and fixity and stuff!

JSHC.Compile.compile = function (input) {
    var res = JSHC.parse(input);
    JSHC.Simplify.simplify(res);
    return JSHC.Codegen.codegen(res);
}
