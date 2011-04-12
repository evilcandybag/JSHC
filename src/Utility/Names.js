
////////////////////////////////////////////////////////////////////////////////

/*
  abstract class for names.
  all subclasses must contain a member "id", and if has a position in a source
  file it must also contain a "pos" with that position.
*/
JSHC.Name = function(){
};
JSHC.Name.prototype.equal = function(other){
    return this.id === other.id && this.name === other.name;
}

////////////////////////////////////////////////////////////////////////////////

// no location parameter as module names are never qualified and always global.
JSHC.ModName = function(id,pos){
    this.name = "modname";
    this.id = id;
    this.pos = pos;
};
JSHC.ModName.prototype = new JSHC.Name();
JSHC.ModName.prototype.toStringN = function(){
    return this.id;
};
JSHC.ModName.prototype.toStringQ = function(){
    return this.toStringN();
};
JSHC.ModName.prototype.toString = function(){
    return "module " + this.toStringQ();
};

////////////////////////////////////////////////////////////////////////////////

JSHC.TyCls = function(id,pos,loc){
    this.name = "tycls";
    if( loc !== undefined ){
        this.loc = loc;
    }
    this.id = id;
    this.pos = pos;
};
JSHC.TyCls.prototype = new JSHC.Name();
JSHC.TyCls.prototype.toStringN = function(){
    return this.id;
};
JSHC.TyCls.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc) + this.toStringN();
};
JSHC.TyCls.prototype.toString = function(){
    return "type class " + this.toStringQ();
};

////////////////////////////////////////////////////////////////////////////////

// no location parameter as they are never top-level names.
JSHC.TyVar = function(id,pos){
    this.name = "tyvar";
    this.id = id;
    this.pos = pos;
};
JSHC.TyVar.prototype = new JSHC.Name();
JSHC.TyVar.prototype.toStringN = function(){
    return this.id;
};
JSHC.TyVar.prototype.toStringQ = function(){
    return this.toStringN();
};
JSHC.TyVar.prototype.toString = function(){
    return "type variable " + this.toStringQ();
};

////////////////////////////////////////////////////////////////////////////////

JSHC.TyCon = function(id,pos,loc){
    this.name = "tycon";
    if( loc !== undefined ){
        this.loc = loc;
    }
    this.id = id;
    this.pos = pos;
};
JSHC.TyCon.prototype = new JSHC.Name();
JSHC.TyCon.prototype.toStringN = function(){
    return this.id;
};
JSHC.TyCon.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc) + this.toStringN();
};
JSHC.TyCon.prototype.toString = function(){
    return "type constructor " + this.toStringQ();
};

////////////////////////////////////////////////////////////////////////////////

JSHC.DaCon = function(id,pos,isSymbol,loc){
    assert.ok( typeof isSymbol === "boolean" );
    this.name = "dacon";
    if( loc !== undefined ){
        this.loc = loc;
    }
    this.id = id;
    this.isSymbol = isSymbol;
    this.pos = pos;
};
JSHC.DaCon.prototype = new JSHC.Name();
JSHC.DaCon.prototype.toStringN = function(){
    return (this.isSymbol ? "("+this.id+")" : this.id);
};
JSHC.DaCon.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc) + this.toStringN();
};
JSHC.DaCon.prototype.toString = function(){
    return "data constructor " + this.toStringQ();
};

////////////////////////////////////////////////////////////////////////////////

JSHC.VarName = function(id,pos,isSymbol,loc){
    assert.ok( typeof isSymbol === "boolean" );
    this.name = "varname";
    if( loc !== undefined ){
        this.loc = loc;
    }
    this.id = id;
    this.isSymbol = isSymbol;
    this.pos = pos;
};
JSHC.VarName.prototype = new JSHC.Name();
JSHC.VarName.prototype.toStringN = function(){
    return (this.isSymbol ? "("+this.id+")" : this.id);
};
JSHC.VarName.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc) + this.toStringN();
};
JSHC.VarName.prototype.toString = function(){
    return "variable " + this.toStringQ();
};

////////////////////////////////////////////////////////////////////////////////
