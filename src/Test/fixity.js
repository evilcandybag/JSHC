JSHC.Test.Tests.fixity = function(tester){
    var cases = {};
    cases.prelude = {
    //test fixity of operators in prelude
        fileSystem: {"Prel": "module Prel where\n"+
        	"x = 1"
                      },
        commands: {
        	"True && False || True": "True",
        	"(True || False) && False": "False",
        	"True || False && False": "True",
        	"1 < 2 && 3 > 4": "False",
        	"1 + 2 * 10": "21",
        	"2 / 2 * 10": "10",
        	"1 + 2 / 2 - 3 * 10": "-28",
        	"1 + 2 / 2 - 3 * 10 < 2 / 2 * 10": "True",
        	"1 + 2 / 2 - 3 * 10 < 2 / 2 * 10 && False": "False",
                   }
    };
    cases.fix = {
    //test fixity of user defined operators
        fileSystem: {"Fix": "module Fix where\n"+
        	"x *** y = (+) x y\n"+
        	"x +++ y = (*) x y\n"+
        	"infixl 7 ***\n"+
        	"infixl 6 +++\n"
                      },
        commands: {
        	"1 *** 2 +++ 10": "30",
        	"2 +++ 2 +++ 10": "40",
        	"1 *** 2 +++ 2 *** 3 +++ 10": "150",
                   }
    };
    

    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "fixity-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};

/*
infixr 3 &&
infixr 2 ||

infixl 7 *, /
infixl 6 +, -


infix 4 < , > , <= , >= , == , /=

*/
