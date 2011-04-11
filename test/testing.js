//only for testing WIP, not needed in release


function fakeLex(input) {
    var x = JSHC.Parser.preL(JSHC.Parser.tokenize.parse(input));
    var l = new iterL();
    l.setInput(x);
    var res = [];
    var thing = "";
    while (thing != "EOF") {
        thing = l.lex();
        res.push(thing);
    }
    return res;
}

JSHC.testCompile = function (tests) {
    for (var i = 0; i < tests.length; i++) {
        document.writeln("<p> Compiling program: <br>" + tests[i] + "<br>" + fakeLex(tests[i]) + "<br>");
//        try {
            res = JSHC.parse(tests[i]);
            var prog = JSHC.Compiler.compile(res);
            document.writeln("Success!<br>");
//            document.writeln(format(showAST(res)));
            document.writeln(prog);
            document.writeln("</p>");
//        } catch (e) {
//            document.writeln("Encountered error:<br>");
//            document.writeln(e.message + "</p>")
//        }
    }
}

JSHC.testParse = function (tests) {
    for (var i = 0; i < tests.length; i++) {
        document.writeln("<p> Parsing program: <br>" + tests[i] + "<br>" + fakeLex(tests[i]) + "<br>");
        try {
            res = parse(tests[i]);
            document.writeln("Success!<br>");
            document.writeln(format(showAST(res)));
            document.writeln("</p>");
        } catch (e) {
            document.writeln("Encountered error:<br>");
            document.writeln(e.message + "</p>")
        }
    }
}


