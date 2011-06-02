
JSHC.Test.Tests.exports = function(tester){
    var fss = {};

    fss.e1 = {
      fileSystem: {
         "A": "module A where\n"+
              "import B\n"+
              "x=3\n",
         "B": "module B where\n"+
              "import A\n"+
              "y=4\n"
       },
       commands: {
         "A.x": "3",
         "B.y": "4",
       }
    }

    fss.e2 = {
      fileSystem: {
         "A": "module A where\n"+
              "import B\n"+
              "x=3\n",
         "B": "module B where\n"+
              "import A\n"+
              "x=4\n"
       },
       commands: {
         "A.x": "3",
         "B.x": "4",
       }
    }

    for(var fs in fss){
        JSHC.Test.runData(tester,
            {name: "export-"+fs,
             errors: 0,
             fileSystem: fss[fs].fileSystem,
             commands: fss[fs].commands});
    }
};
