/* Module containing example programs for use as test cases when testing JSHC */

var tests = function () {
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
        "module A where\na x = x 1\nimport B ",
        "module A where\nimport B\nimport C \na x = x 1\nimport D"
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
        "f = \\ a -> \n  case a of\n    B -> 2",
        "f = \\ a -> \n  case a of\n    x -> x",
        "f = \\ a -> \n  case a of\n    B x y -> x y 2",
        "f = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1",
        "f = \\ a b -> \n  case a of\n    b -> 2",
        "f = \\ a b -> \n  case a of\n    b -> 2\n    2 -> 1",
        "f = \\ a b c -> \n  case a of\n    b -> c",
        "f = \\ a b c -> \n  case a of\n    b -> 2\n    c -> 1",
        "f = \\ a -> \n  case a of\n    B -> 2\n    C -> 1",
//        "f = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1\n 3 -> 2",
        "f = \\ a -> a + 1\nf = \\ a b -> a + 1\nf = \\ a -> \n  case a of\n    1 -> 2\nf = \\ a -> \n  case a of\n    1 -> 2\n    2 -> 1\nf = \\ a b -> \n  case a of\n    b -> 2\nf = \\ a b -> \n  case a of\n    b -> 2\n    2 -> 1\nf = \\ a b c -> \n  case a of\n    b -> c\nf = \\ a b c -> \n  case a of\n    b -> 2\n    c -> 1\nf = \\ a -> \n  case a of\n    B -> 2\n    C -> 1",
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
}
