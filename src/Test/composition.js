JSHC.Test.Tests.composition = function(tester){
    var cases = {};
    cases.comp1 = {
        fileSystem: {"Comp1": "module Comp1 where\n"+
    		"f x y = (\\ z -> z + x) . (\\ z -> z + y)\n"+
    		"g x y = (\\ z -> z * x) . (\\ z -> z * y)\n"+
    		"h = let i = (f 1 2) . (\\ x -> x + 1)  in  g 1 2 $ i 2\n" 
                      },
        commands: {
        	"f 2 4 2": "8",
        	"f 2 2 2": "6",
        	"f 1 1 1": "3",
        	"g 1 2 $ f 1 2 3": "12",
        	"h": "12"


        	
                   }
    };
    
    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "composition-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};
