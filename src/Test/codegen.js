/*
  Test cases for testing the output when evaluating a program generated
  by JSHC. Should contain members that are arrays that contain objects
  with the following structure:
  {
    p: <the program to compile, as a string>,
    r: <an expression, as a string, of the javascript expression used to run 
        the generated program, e.g. "modules.Main["f"]()">
    e: <the expected result of the executed program>
  }
*/

JSHC.Test.Cases.codegen = function () {
    
    this.where = [
    {
        p: "f = x where x = 1",
        r: "modules.Main[\"f\"]()",
        e: 1
    },
    {
        p: "f = x 1 where x z = Prelude.add 1 z",
        r: "modules.Main[\"f\"]()", 
        e: 2
    },
    {
        p: "f = Prelude.add x y where\n x = 1\n y = 2",
        r: "modules.Main[\"f\"]()", 
        e: 3
    },    
    {
        p: "f = Prelude.add x y where x = 1\n                          y = 2",
        r: "modules.Main[\"f\"]()", 
        e: 3
    },
    {
        p: "f = Prelude.add x y\n where\n  x = 1\n  y = 2",
        r: "modules.Main[\"f\"]()", 
        e: 3
    },

    ]
   
    
    
}
