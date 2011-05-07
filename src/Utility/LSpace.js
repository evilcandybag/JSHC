
////////////////////////////////////////////////////////////////////////////////

JSHC.LSpace = function(){
    this.sets = [];
};

JSHC.LSpace.prototype.add = function(name){
    this.getCurrent().add(name);
};

JSHC.LSpace.prototype.rem = function(name){
    this.getCurrent().rem(name);
};

JSHC.LSpace.prototype.push = function(){
    this.sets.push(new JSHC.Set(true,"toString"));
};

JSHC.LSpace.prototype.pop = function(){
    assert.ok( this.sets.length > 0 );
    this.sets.pop();
};

JSHC.LSpace.prototype.popEmpty = function(){
    assert.ok( this.sets.length > 0 );
    assert.ok( this.sets[this.sets.length-1].isEmpty() );
    this.sets.pop();
};

JSHC.LSpace.prototype.getAll = function(){
    return this.sets;
};

JSHC.LSpace.prototype.getCurrent = function(){
    assert.ok( this.sets.length > 0 );
    return this.sets[this.sets.length-1];
};

/*
    Tries to find the given name in the lspace.
    Returns undefined if not found.
*/
JSHC.LSpace.prototype.lookup = function(name){
    assert.ok( name !== undefined );

    for(var ix=this.sets.length-1 ; ix>=0 ; ix--){
        n = this.sets[ix].lookup(name);
	if( n !== undefined ){
	    return n;
	}
    }
    return undefined;
};

JSHC.LSpace.prototype.withSpace = function(fun){
    this.push();
    fun();
    this.pop();
};

////////////////////////////////////////////////////////////////////////////////
