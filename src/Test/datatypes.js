
JSHC.Test.Tests.datatypes = function(tester){
    var cases = {};
    cases.listtype = {
        fileSystem: {"ListModule": "module ListModule where\n"+
                     "data List a = Nil | Cons a (List a)\n"},
        commands: {":kind List": "(* -> *)",
                   ":type Nil": "forall a. (List a)",
                   ":type Cons": "forall a. (a -> (List a) -> (List a))"}
    }

    for(var cname in cases){
        JSHC.Test.runData(tester,
            {name: "datatype-"+cname,
             errors: 0,
             fileSystem: cases[cname].fileSystem,
             commands: cases[cname].commands});
    }
};
