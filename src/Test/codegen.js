
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

                   "null []": "True",
                   "null [undefined]": "False",

                   "take 4 $ iterate (\\ x -> x + 1) 0": "[0,1,2,3]",

                   "take 3 $ repeat 2": "[2,2,2]",
                   
                   "replicate 0 undefined": "[]",
                   "replicate 3 5": "[5,5,5]",

                   "[] ++ []": "[]",
                   "[1] ++ []": "[1]",
                   "[1,2] ++ []": "[1,2]",
                   "[1,2,3] ++ []": "[1,2,3]",
                   "[] ++ [1]": "[1]",
                   "[1] ++ [2]": "[1,2]",
                   "[1,2] ++ [3]": "[1,2,3]",
                   "[1,2,3] ++ [4]": "[1,2,3,4]",
                   "[] ++ [2,1]": "[2,1]",
                   "[1] ++ [5,2]": "[1,5,2]",
                   "[1,2] ++ [0,3]": "[1,2,0,3]",
                   "[1,2,3] ++ [7,4]": "[1,2,3,7,4]",
                   "[] ++ [0,2,1]": "[0,2,1]",
                   "[1] ++ [9,5,2]": "[1,9,5,2]",
                   "[1,2] ++ [4,0,3]": "[1,2,4,0,3]",
                   "[1,2,3] ++ [0,7,4]": "[1,2,3,0,7,4]",

                   "take 4 $ [1,2] ++ [3,4,undefined]": "[1,2,3,4]",
                   "take 3 $ [1,2] ++ [3,undefined]": "[1,2,3]",
                   "take 2 $ [1,2] ++ [undefined]": "[1,2]",
                   "take 2 $ [1,2] ++ undefined": "[1,2]",
                   "take 1 $ [1,undefined] ++ undefined": "[1]",
                   "take 0 $ undefined ++ undefined": "[]",
                   "take 0 $ undefined": "[]",

                   "take 7 $ cycle [0,1,2]": "[0,1,2,0,1,2,0]",
                   "take 0 $ cycle [undefined]": "[]",
                   "take 1 $ cycle [2,undefined]": "[2]",
                   "cycle []": null,

                   "drop 3 [1,2,3,4,5]": "[4,5]",
                   "drop 0 [1,2,3]": "[1,2,3]",
                   "drop 1 [1,2]": "[2]",
                   "drop 1 [3]": "[]",
                   "drop 1 []": "[]",
                   "drop 1 [undefined]": "[]",
                   "drop 1 [undefined,2]": "[2]",
                   "tail $ drop 0 [undefined,2]": "[2]",
                   "drop 0 []": "[]",
                   "drop 0 [4]": "[4]",

                   "splitAt 0 [1,2,3,4,5]": "([],[1,2,3,4,5])",
                   "splitAt 1 [1,2,3,4,5]": "([1],[2,3,4,5])",
                   "splitAt 3 [1,2,3,4,5]": "([1,2,3],[4,5])",
                   "splitAt 5 [1,2,3,4,5]": "([1,2,3,4,5],[])",
                   "splitAt 6 [1,2,3,4,5]": "([1,2,3,4,5],[])",
                   "splitAt 6 []": "([],[])",
                   "splitAt (negate 1) []": "([],[])",

                   "negate (0-3)": "3",
                   "negate 0": "0",
                   "negate 4": "-4",

                   "signum 0": "0",
                   "signum 2": "1",
                   "signum (0-3)": "-1",

                   "abs (0-3)": "3",
                   "abs 0": "0",
                   "abs 4": "4",

                   "foldr1 (+) [3,4]": "7",
                   "foldr1 (+) [0]": "0",
                   "foldr1 (+) []": null,
                   "foldr1 (\\ x y -> y) [3,4,5]": "5",
                   "foldr1 (\\ x y -> y) [undefined,undefined,5]": "5",

                   "foldl (++) [] [[1],[2],[3]]": "[1,2,3]",
                   "take 2 $ foldl (++) [] [[1],[2],[undefined]]": "[1,2]",

                   "reverse [1,2,3]": "[3,2,1]",
                   "reverse [1,2]": "[2,1]",
                   "reverse [1]": "[1]",
                   "reverse []": "[]",
                   "reverse undefined": null,

                   "True && True": "True",
                   "True && False": "False",
                   "False && undefined": "False",

                   "False || True": "True",
                   "False || False": "False",
                   "True || undefined": "True",

                   "and []": "True",
                   "and [True]": "True",
                   "and [True,False]": "False",
                   "and [True,False,undefined]": "False",
                   "or []": "False",
                   "or [True]": "True",
                   "or [True,undefined]": "True",
                   "or [False]": "False",
                   "or [False,undefined]": null,

                   "((\\ x -> x + 1) . (\\ x -> x + 2)) 0": "3",

                   "any (\\ x -> x > 0 ) []": "False",
                   "any (\\ x -> x > 0 ) [3,4]": "True",
                   "any (\\ x -> x > 0 ) [negate 3]": "False",

                   "elem 3 [3,4]": "True",
                   "elem 5 [3,4]": "False",
                   "elem 1 [1]": "True",
                   "elem 1 [2]": "False",
                   "elem 3 []": "False",

                   "max 3 4": "4",
                   "max 2 (negate 1)": "2",
                   "min 3 4": "3",
                   "min 2 (negate 1)": "-1",
        }
    }

                   // f x y = (\ z -> z + x) . (\ z -> z + y)
                   // "f 3 4 2": "9"

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
