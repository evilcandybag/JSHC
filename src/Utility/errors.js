
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

    this.name = "SourceError";
    this.message = message;
};
JSHC.CompilerError.prototype = new Error();

////////////////////////////////////////////////////////////////////////////////

JSHC.TypeError = function(type1,type2){
    assert.ok( type1 !== undefined );
    assert.ok( type2 !== undefined );

    var err = new Error();  // error object used to initialize some members
    for(var k in err){
       this[k] = err[k];
    }

    this.name = "TypeError";
    this.type1 = type1;
    this.type2 = type2;
};
JSHC.TypeError.prototype = new Error();

JSHC.TypeError.prototype.toString = function(){
    return "value: "+this.value
          +", expected: "+this.type1
          +", inferred: "+this.type2
          +", at "+JSHC.showPos(this.value.pos);
};

////////////////////////////////////////////////////////////////////////////////
