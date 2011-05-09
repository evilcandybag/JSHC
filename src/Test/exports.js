
JSHC.Test.Tests.exports = function(tester){
    var fss = {};
    fss.e1 = {
        "A": "module A where\n"+
             "import B\n"+
             "x=3\n",
        "B": "module B where\n"+
             "import A\n"+
             "y=4\n"
    }

    var cases = {};    
    for(var fs in fss){
        JSHC.Test.runData(
            {name: "export-"+fs,
             errors: 0,
             fileSystem: fss[fs]},tester);
    }
};
