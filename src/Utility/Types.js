////////////////////////////////////////////////////////////////////////////////

JSHC.FunType = function(types,pos){
    assert.ok( types.length !== undefined );
    assert.ok( types.length !== 1 );
    assert.ok( types instanceof Array );
    this.name = "funtype";
    this.types = types;
    if( pos !== undefined ){
       this.pos = pos;
    }
};
JSHC.FunType.prototype.toString = function(){
    var m = ["("];
    for(var type in this.types){
	m.push(this.types[type]);
	m.push(" -> ");
    };
    m.pop();
    m.push(")");
    return m.join("");
};

JSHC.AppType = function(fun,arg,pos){
    assert.ok( fun !== undefined );
    assert.ok( arg !== undefined );
    this.name = "apptype";
    this.lhs = fun;
    this.rhs = arg;
    if( pos !== undefined ){
       this.pos = pos;
    }
};
JSHC.AppType.prototype.toString = function(){
    return "("+this.lhs+" "+this.rhs+")";
};

////////////////////////////////////////////////////////////////////////////////
