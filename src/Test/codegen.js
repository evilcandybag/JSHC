
JSHC.Test.Tests.codegen = function(tester){
    var cases = {};
    
    cases.arith = {
        fileSystem: {"Arith": "module Arith where\n" +
                     "a x y = x + y\n"+
                     "b x y = x - y\n"+
                     "c x y = x / y\n"+
                     "d x y = x * y\n"+
                     "e x y = x + 2 - y\n"+
                     "f x y = x + 2 + y\n"+
                     "g x y = x + 4 / y\n"+
                     "h x y = x + 2 * y\n"+
                     "i x y = x + 2 - y + 3\n"+
                     "j x y = x + 2 * y + 3\n"+
                     "k x y = x + 2 / y + 3\n"
                      },
        commands: {
                   "a 1 2": "3",
                   "b 5 2": "3",
                   "c 4 2": "2",
                   "d 2 2": "4",
                   "e 1 2": "1",
                   "f 1 2": "5",
                   "g 1 2": "3",
                   "h 1 10": "21",
                   "i 1 2": "4",
                   "j 1 2": "8",
                   "k 1 2": "5"
                   }
    }
    
    cases.wheres = {
        fileSystem: {"Wheres": "module Wheres where\n"+
           "a = x where x = 1\n"+
           "b = x 1 where x z = 1 + z\n"+
           "c = x + y where\n x = 1\n y = 2\n"+
           "d = x + y where x = 1\n                y = 2\n"+
           "e = x + y\n where\n  x = 1\n  y = 2\n"
           },
        commands: {
            "a": "1",
            "b": "2",
            "c": "3",
            "d": "3",
            "e": "3",
        }
    }
       
    cases.lets = {
        fileSystem: { "Lets": "module Lets where\n"+
           "a = let x = 1 in x\n"+
           "b = let x z = 1 + z in x 1\n"+
           "c = let\n x = 1\n y = 2\n in x + y\n"+
           "d = let x = 1\n        y = 2\n        in x + y\n"+
           "e =\n let x = 1\n     y = 2\n  in x + y\n"
        },
        commands: {
            "a": "1",
            "b": "2",
            "c": "3",
            "d": "3",
            "e": "3",
        }
    
    }
       


    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "codegen-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};


