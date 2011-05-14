
////////////////////////////////////////////////////////////////////////////////

/*
  function type
*/
JSHC.FunType = function(types,pos){
    assert.ok( types.length !== undefined );
    assert.ok( types.length > 1 );
    assert.ok( types instanceof Array );
    this.name = "funtype";
    this.types = types;
    if( pos !== undefined ){
       this.pos = pos;
    }
};
JSHC.FunType.prototype.toString = function(){
    var m = ["("];
    for(var i=0 ; i<this.types.length ; i++){
	m.push(this.types[i]);
	m.push(" -> ");
    };
    m.pop();
    m.push(")");
    return m.join("");
};
JSHC.FunType.prototype.toStringQ = JSHC.FunType.prototype.toString;

/*
  application type
*/
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
JSHC.AppType.prototype.toStringQ = JSHC.AppType.prototype.toString;

/*
  forall type
*/
JSHC.ForallType = function(binds,type){
    this.name = "forall";
    if( binds instanceof Array ){
        this.binds = {};
        for(var ix=0 ; ix<binds.length ; ix++){
            this.binds[binds[ix]] = binds[ix];
        }
    } else {
        this.binds = binds;  // set of bound type variables
    }
    this.type = type;    // the inner type
};
JSHC.ForallType.prototype.toString = function(){
    var m = [];
    m.push("forall");
    for(var tv in this.binds){
	m.push(" ");
	m.push(tv.toString());
    };
    m.push(". ");
    m.push(this.type.toString());
    return m.join("");
};
JSHC.ForallType.prototype.toStringQ = JSHC.ForallType.prototype.toString;

////////////////////////////////////////////////////////////////////////////////
