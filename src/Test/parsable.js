/* Module containing example programs for use as test cases when testing JSHC */

JSHC.Test.Cases.parsable = function () {
    //test cases for different headers and imports
    this.modules = [
        "module A where\nimport B ",
        "module A where\nimport B (c)",
        "module A where\nimport B (c, d)",
        "module A where\nimport B (c, d,)",
        "module A where\nimport B \na x = x 1",
        "module A where\nimport B hiding (c)",
        "module A where\nimport B hiding (c, d)",
        "module A where\nimport B hiding (c, d,)",
        "module A where\nimport B\nimport C",
        "module A where\nimport B (c)\nimport C",
        "module A where\nimport B (c, d)\nimport C",
        "module A where\nimport B (c, d,)\nimport C",
        "module A where\nimport B\nimport C \na x = x 1",
        "module A where\nimport B hiding (c)\nimport C",
        "module A where\nimport B hiding (c, d)\nimport C",
        "module A where\nimport B hiding (c, d,)\nimport C",
        "module A (a) where\nimport B ",
        "module A (a,b) where\nimport B ",
        "module A (a,b,)where\nimport B ",
//        "module A where\na x = x 1\nimport B ",
//        "module A where\nimport B\nimport C \na x = x 1\nimport D"
    ]

    this.arith = [
        "f = 1",
        "f x = x + 1",
        "f x y = x - y + x"        
    ]

    this.lambda = [
        "f = \\ a -> g a\ng = \\ a -> Prelude.add a 1",
//        "add = \\ a b -> (+) a b",
//        "f = \\ a -> a + 1",
//        "f = \\ a b -> a + 1",
        "f = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1",
        "f = \\ a b -> \n  case a of\n    b -> 2",
        "f = \\ a b -> \n  case a of\n    b -> 2\n    2 -> 1",
        "f = \\ a b c -> \n  case a of\n    b -> c",
        "f = \\ a b c -> \n  case a of\n    b -> 2\n    c -> 1",
        "f = \\ a -> \n  case a of\n    B -> 2\n    C -> 1",
//        "f = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1\n 3 -> 2",
        "f = \\ a -> a + 1\nf = \\ a b -> a + 1\nf = \\ a -> \n  case a of\n    1 -> 2\nf = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1\nf = \\ a b -> \n  case a of\n    b -> 2\nf = \\ a b -> \n  case a of\n    b -> 2\n    2 -> 1\nf = \\ a b c -> \n  case a of\n    b -> c\nf = \\ a b c -> \n  case a of\n    b -> 2\n    c -> 1\nf = \\ a -> \n  case a of\n    B -> 2\n    C -> 1",
    ]

    this.cases = [
        "f = \\ a -> case a of\n  B -> 2",
        "f = \\ a -> case a of\n  x -> x",
        "f = \\ a -> case a of\n  B x y -> x y 2\n  C -> 1\n  x -> 9",
        "f = \\ a -> case a of\n  x -> 9\n  B x y -> x y 2\n  C -> 1",        
        "f = \\ a -> case a of\n  B x y -> x y 2\n  x -> 9\n  C -> 1",
    ] 

    this.ite = [
        "f = \\ a -> if a then 1 else 2",
        "f = if a then 1 else 2",
    ]

    this.tuple = [
        "f = (1)",
        "f = (1,B)",
        "f = (2,4,5)",
    ]

    this.lets = [
//        "let x in x "
        "f = let { x = 1 } in x",
        "f = let { x = 1 ; y = 2 } in Prelude.add x y",
        "f = let { x = 1 ; y = 2 ; z = 5 } in Prelude.mul (Prelude.add x y) z",
//        "f = \n let\n x = 1\n y = 2\n z = 5\nin Prelude.mul (Prelude.add x y) z",

    ]
    
    this.constr = [
        "f = B",
        "f = B 1",
        "f = B C",
        "f = B (C 1)",
        "f = B (C 1) 2",
        "f = B (C 1) D",
    ]

    this.data = [
//    "f = 1",
    "data A",
    "data A\ndata B",
    "data A b",
    "data A = B | C",
    "data A b = B | C b",
    "data A b = B b | C Int"
    ]

    this.mix = [
        "data A = B | C\nf = \\ a -> a + 1\nf = \\ a b -> a + 1\nf = \\ a -> \n  case a of\n    1 -> 2\nf = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1\nf = \\ a b -> \n  case a of\n    b -> 2\nf = \\ a b -> \n  case a of\n    b -> 2\n    2 -> 1\nf = \\ a b c -> \n  case a of\n    b -> c\nf = \\ a b c -> \n  case a of\n    b -> 2\n    c -> 1\nf = \\ a -> \n  case a of\n    B -> 2\n    C -> 1",
    ]
    
    this.lazy = [
        "e = D Prelude.undefined 2\nf = \\ a -> case a of\n  D x 0 -> x\n  D x y -> y\ng = Main.f Main.e",
        "e = Main.e",
    ]

    this.demo = [
        "f = B.x y",
        "module A where\nf = \\ a -> case a of\n  B x y -> x y 2\n  C -> 1\n  x -> 9\ng = C\nk = A.f A.g",
        "module B where\nf = \\ a -> case a of\n  B x y -> x y 2\n  C -> 1\n  x -> 9\ng = B Prelude.mul 4\nk = B.f B.g",
        "module C where\nf = \\ a -> case a of\n  B x y -> x y 2\n  C -> 1\n  x -> 9\ng = B Prelude.add 1\nk = C.f C.g",
        "module D where\nf = \\ a -> case a of\n  x -> 9\n  B x y -> x y 2\n  C -> 1\ng = C\nk = D.f D.g",
        "module E where\nf = \\ a -> case a of\n  x -> 9\n  B x y -> x y 2\n  C -> 1\ng = B Prelude.mul 4\nk = E.f E.g",
        "module F where\nf = \\ a -> case a of\n  x -> 9\n  B x y -> x y 2\n  C -> 1\ng = B Prelude.add 1\nk = F.f F.g",        
        "module G where\nf = \\ a -> case a of\n  B x y -> x y 2\n  x -> 9\n  C -> 1\ng = Q\nk = G.f G.g",
        "module H where\nf = \\ a -> case a of\n  B x y -> x y 2\n  x -> 9\n  C -> 1\ng = B Prelude.mul 4\nk = H.f H.g",
        "module I where\nf = \\ a -> case a of\n  B x y -> x y 2\n  x -> 9\n  C -> 1\ng = B Prelude.add 1\nk = I.f I.g",
        "module J where\nf = \\ a -> case a of\n  B x y -> x y 2\n  x -> 9\n  C -> 1\ng = C\nk = J.f J.g",
        "module K where\nf = \\ a -> \\ b -> Prelude.sub  (Prelude.mul b a) (Prelude.add a b)\nk = K.f 3 4",
    ]
    
}
