JSHC.Test.Tests.types = function(tester){
    var cases = {};

    cases.t1 = {
        fileSystem: {
          "T1": "module T1 where\n"+
          "x = x\n"+
          "y = \\ z -> x\n"+
          "z = \\ x -> x\n"
        },
        commands: {
          ":type x": "forall a. a",
          ":type y": "forall a b. (a -> b)",
          ":type z": "forall a. (a -> a)",

          // check type of "Prelude.id".
          ":type id": "forall a. (a -> a)",
        }
    }

    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "types-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};
