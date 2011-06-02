
JSHC.Test.Tests.codegen = function(tester){
    var cases = {};

    // laziness in case expressions
    cases.laziness1 = {
        fileSystem: {"Laziness1": "module Laziness1 where\n" +
                     "y = undefined\n"+
                     "x1 = case y of z -> 2\n"+
                     "x2 = case undefined of z -> 3\n"+
                     "cp1 = case (1,undefined) of\n"+
                     "  (2,0) -> 5\n"+
                     "  (1,0) -> 6\n"+
                     "cp2 = case (undefined 2,1) of\n"+
                     "  (_,1) -> 5\n"+
                     "  (_,1) -> 6\n"+
                     "cp3 = case (undefined 2,1) of\n"+
                     "  (2,1) -> 5\n"+
                     "  (_,1) -> 6\n"+
                     "cp4 = case (1,undefined) of\n"+
                     "  (2,0) -> 5\n"+
                     "  (1,_) -> 6\n"+

                     "data D a b = C a b\n"+
                     "dcx1 = case C 0 undefined of\n"+
                     "  C 1 2 -> 5\n"+
                     "  C 0 3 -> 6\n"+

                     "dcx2 = case C 0 undefined of\n"+
                     "  C 1 2 -> 5\n"+
                     "  C 0 _ -> 6\n"+

                     "cc1 = case undefined of 1 -> 2\n"+
                     "cc2 = case 1 of 1 -> undefined\n"+

                     ""
        },
        commands: {
                   "x1": "2",
                   "x2": "3",
                   "cp1": null,
                   "cp2": "5",
                   "cp3": null,
                   "cp4": "6",
                   "dcx1": null,
                   "dcx2": "6",
                   "const 1 cc1": "1",
                   "const cc1 1": null,
                   "const 1 cc2": "1",
                   "const cc2 1": null,
                   "const 1 (case undefined of { 1 -> 2 } )": "1",
       }
    }

    // laziness with lists
    cases.laziness2 = {
        fileSystem: {"Laziness2": "module Laziness2 where\n" +
                     "n0 = take 0 [ undefined ]\n"+
                     "n1 = take 1 [ 1, undefined ]\n"+
                     "n2 = take 2 [ 1, 2, undefined ]\n"+
                     "ones = 1 : ones\n"+
                     "twos = map (\\ x -> x+1) ones\n"+
                     "undefs = undefined : undefs\n"+
                     "\n"+
                     "x2 = case undefined of z -> 3\n"+
                     "f x y = undefined\n"+
                     "fones = f 1 ones\n"+
        ""},
        commands: {
                   "n0": "[]",
                   "n1": "[1]",
                   "n2": "[1,2]",
                   "head ones": "1",
                   //"tail ones",     // can not test for infinite loop
                   "take 0 ones": "[]",
                   "take 1 ones": "[1]",
                   "take 2 ones": "[1,1]",
                   "take 0 (map id ones)": "[]",
                   "take 1 (map id ones)": "[1]",
                   "take 2 (map id ones)": "[1,1]",
                   "take 0 twos": "[]",
                   "take 1 twos": "[2]",
                   "take 2 twos": "[2,2]",

                   // laziness of in accessing a list with/without the elements
                   "length [undefined]": "1",
                   "head [ 1, undefined ]": "1",
                   "head (1 : [undefined])": "1",
                   //"head [undefined]": null,
                   "length [undefined,undefined]": "2",
                   //"head [undefined,undefined]": null,
                   //"tail [undefined,undefined]": null,
                   "length $ take 0 undefs": "0",
                   "length $ take 1 undefs": "1",
                   "length $ take 2 undefs": "2",

                   // test lazy evaluation of identity lambda function
                   "length $ map (\\ x -> x) []": "0",
                   "length $ map (\\ x -> x) [undefined]": "1",
                   "length $ map (\\ x -> x) [undefined,undefined]": "2",
                   // test lazy evaluation of addition lambda function
                   "length $ map (\\ x -> x+1) []": "0",
                   "length $ map (\\ x -> x+1) [undefined]": "1",
                   "length $ map (\\ x -> x+1) [undefined,undefined]": "2",

                   // not evaluating function applications when compiling
                   "fones": null,
        }
    }

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

    // use boolean result of foreign function
    cases.ffi = {
        fileSystem: {
          "FFI": "module FFI where\n"+
          "x1 = if 2<3 then 4 else 5\n"+
          "x2 = if 2<=3 then 4 else 5\n"+
          "x3 = if 2>3 then 4 else 5\n"+
          "x4 = if 2>=3 then 4 else 5\n"+
          "x5 = if 2/=3 then 4 else 5\n"+
          "x6 = if 2==3 then 4 else 5\n"+
          "y1 = 2<3\n"+
          "y2 = 2<=3\n"+
          "y3 = 2>3\n"+
          "y4 = 2>=3\n"+
          "y5 = 2/=3\n"+
          "y6 = 2==3\n"
        },
        commands: {
          "x1": "4",
          "x2": "4",
          "x3": "5",
          "x4": "5",
          "x5": "4",
          "x6": "5",
          "y1": "True",
          "y2": "True",
          "y3": "False",
          "y4": "False",
          "y5": "True",
          "y6": "False"
       }
    }

    // using integers in case expression
    cases.caseexp = {
        fileSystem: {
          "Caseexp": "module Caseexp where\n"+
          "x = case 3 of q -> q\n"+
          "y = case 3 of 2 -> 4 ; q -> q\n"+
          "z = case 3 of 3 -> 4 ; q -> q\n"
        },
        commands: {
          "x": "3",
          "y": "3",
          "z": "4"
        }
    }

    // using Prelude.Bool
    cases.bool = {
        fileSystem: {
          "Bool": "module Bool where\n"+
          "x = True\n"+
          "y = False\n"
        },
        commands: {
          "x": "True",
          "y": "False"
        }
    }

    cases.lambda = {
        fileSystem: {"Lambda": "module Lambda where\n"+
        "a = \\ a -> g a\ng = \\ a -> a + 1\n"+
        "b = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1\n"+
        "c = \\ a b -> \n  case a of\n    b -> 2\n"+
        "d = \\ a b -> \n  case a of\n    b -> 2\n    2 -> 1\n"+
        "e = \\ a b c -> \n  case a of\n    b -> c\n"+
        "f = \\ a b c -> \n  case a of\n    b -> 2\n    c -> 1\n"
        },
        commands: {
        "a 1": "2",
        "b 1": "2",
        "c 1 1": "2",
        "d 1 2": "2",
        "e 1 1 3": "3",
        "f 1 4 1": "2"
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
