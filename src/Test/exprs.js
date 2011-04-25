JSHC.Test.Cases.exprs = function () {
    this.apps = [
        "Main.x y c",
    ]
    
    this.control = [
        "let { a = 0 } in a",
        "case a of a -> a",
        "if a then a else a",
    ]
}
