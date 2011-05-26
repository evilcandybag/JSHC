
////////////////////////////////////////////////////////////////////////////////

/*
  contains:
  * module name
  * position
  * message
  
  describes an error in the source code being compiled.
*/
JSHC.SourceError = function(mname, pos, message){
    //assert.ok( mname !== undefined );
    //assert.ok( pos !== undefined );
    assert.ok( message !== undefined );

    var err = new Error();  // error object used to initialize some members
    for(var k in err){
       this[k] = err[k];
    }

    this.name = "SourceError";
    this.mname = mname;
    this.pos = pos;
    this.message = message;
};
JSHC.SourceError.prototype = new Error();

JSHC.SourceError.prototype.toString = function(){
    return (this.message !== undefined ? this.message : "")
        +(this.pos !== undefined ? " at " + JSHC.showPos(this.pos) : "")
        +(this.mname !== undefined ? " in " + this.mname : "");
};

////////////////////////////////////////////////////////////////////////////////

/*
  describes an error in the compiler.
*/
JSHC.CompilerError = function(message){
    assert.ok( message !== undefined );

    var err = new Error();  // error object used to initialize some members
    for(var k in err){
       this[k] = err[k];
    }

    this.name = "CompilerError";
    this.message = message;
};
JSHC.CompilerError.prototype = new Error();

////////////////////////////////////////////////////////////////////////////////

/*
  describes an error in the runtime.
*/
JSHC.RuntimeError = function(message){
    assert.ok( message !== undefined );

    var err = new Error();  // error object used to initialize some members
    for(var k in err){
       this[k] = err[k];
    }

    this.name = "RuntimeError";
    this.message = message;
};
JSHC.RuntimeError.prototype = new Error();

JSHC.RuntimeError.prototype.toString = function() {
    return this.name + ": " + this.message;
};

////////////////////////////////////////////////////////////////////////////////

/*
  thrown inside the type checker when working with typing constraints.
  it is caught by the type checker a related value/modid/pos is added later on.
*/
JSHC.TypeConstraintError = function(type1,type2,opt_msg){
    assert.ok( type1 !== undefined );
    assert.ok( type2 !== undefined );

    var err = new Error();  // error object used to initialize some members
    for(var k in err){
       this[k] = err[k];
    }

    this.name = "TypeError";
    this.type1 = type1;
    this.type2 = type2;
    if( typeof opt_msg == "string" ){
        this.msg = opt_msg;
    }
};
JSHC.TypeConstraintError.prototype = new Error();

JSHC.TypeConstraintError.prototype.toString = function(){
    return (this.msg !== undefined ? this.msg+" in " : "")
        +(this.value !== undefined ? "value: " + this.value : "")
        +", expected: " + this.type1
        +", inferred: " + this.type2
        +(this.pos !== undefined ? ", at " + JSHC.showPos(this.pos) : "")
        +(this.mname !== undefined ? ", in " + this.mname : "");
};

////////////////////////////////////////////////////////////////////////////////
