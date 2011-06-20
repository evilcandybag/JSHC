
JSHC.Test.Tests.patternmatch = function(tester){
    var cases = {};
    cases.pat1 = {
        fileSystem: {"Pattern1": "module Pattern1 where\n" +
                     "data A a = B | C a\n"+
        			 "data X a = Y | Z a\n"+
                     "f B = 1\n"+
                     "f (C 2) = 2\n"+
                     "f (C 3) = 3\n"+
                     "f (C x) = x\n"+
                     "g (B,1) = 1\n"+
                     "g (C 2, 2) = 2\n"+
                     "g (C x, y) = x + y\n"+
                     "h (C Y) = 1\n"+
                     "h (C (Z B)) = 2\n"+
                     "h (C (Z (C 1))) = 3\n"+
                     "i (Z (C 1)) = 1\n"+
                     "i (Z (C _)) = 2\n"+
                     "i (Z (C 3)) = 3\n"+
                     "i (Z _) = 4\n"+
                     "i (Z B) = 5\n"+
                     "x 1 = 3\n"+
					 "x y = 5\n"
                      },
        commands: {"f B": "1",
                   "f (C 2)": "2",
                   "f (C 3)": "3",
                   "f (C 4)": "4",
                   "g (B,1)": "1",
                   "g (C 2, 2)": "2",
                   "g ((C 1), 2)": "3",
                   "h (C Y)": "1",
                   "h (C (Z B))": "2",
                   "h (C (Z (C 1)))": "3",
                   "h (C (Z (C 2)))": null,
                   "i (Z (C 1))": "1",
                   "i (Z (C 2))": "2",
                   "i (Z (C 3))": "2",
                   "i (Z B)": "4",
                   "x 1": "3",
                   "x 6": "5"
                   }
    };
    

    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "patternmatch-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};
