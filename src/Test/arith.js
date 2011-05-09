
JSHC.Test.Tests.arith = function(tester){
    var cases = {};
    cases.arith = {
        fileSystem: {"Arith": "module Arith where\n" +
//                     "a x y = x + y\n"+
//                     "b x y = x - y\n"+
//                     "c x y = x / y\n"+
//                     "d x y = x * y\n"+
                     "e x y = x + 2 - y\n"//+
//                     "f x y = x + 2 + y\n"+
//                     "g x y = x + 4 / y\n"+
//                     "h x y = x + 2 * y\n"+
//                     "i x y = x + 2 - y + 3\n"+
//                     "j x y = x + 2 * y + 3\n"+
//                     "k x y = x + 2 / y + 3\n"
                      },
        commands: {
//                   "a 1 2": "3",
//                   "b 5 2": "3",
//                   "c 4 2": "2",
//                   "d 2 2": "4",
                   "e 1 2": "2",
//                   "f 1 2": "5",
//                   "g 1 2": "3",
//                   "h 1 10": "21",
//                   "i 1 2": "4",
//                   "j 1 2": "8",
//                   "k 1 2": "5"
                   }
    }

    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "arith-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};


