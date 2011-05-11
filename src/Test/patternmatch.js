
JSHC.Test.Tests.patternmatch = function(tester){
    var cases = {};
    cases.pat = {
        fileSystem: {"Pattern": "module Pattern where\n" +
                     "data A a = B | C a\n"+
                     "f B = 1\n"+
                     "f (C 2) = 2\n"+
                     "f (C 3) = 3\n"+
                     "f (C x) = x\n"+
                     "g (B,1) = 1\n"+
                     "g (C 2, 2) = 2\n"+
                     "g (C x, y) = x + y\n"
                      },
        commands: {"f B": "1",
                   "f (C 2)": "2",
                   "f (C 3)": "3",
                   "f (C 4)": "4",
                   "g (B,1)": "1",
                   "g (C 2, 2)": "2",
                   "g ((C 1), 2)": "3"
                   }
    }

    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "patternmatch-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};
