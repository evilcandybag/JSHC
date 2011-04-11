
////////////////////////////////////////////////////////////////////////////////

/*
  abstract class for names.
  all subclasses must contain a member "id", and if has a position in a source
  file it must also contain a "pos" with that position.
*/
JSHC.Name = function(){
};

////////////////////////////////////////////////////////////////////////////////

// no location parameter as module names are never qualified and always global.
JSHC.ModName = function(id,pos){
    this.name = "modname";
    this.id = id;
    this.pos = pos;
};
JSHC.ModName.prototype.toString = function(){
    return "module " + this.id;
};
JSHC.ModName.prototype = new JSHC.Name();

////////////////////////////////////////////////////////////////////////////////

JSHC.TyCls = function(id,pos,loc){
    this.name = "tycls";
    if( loc !== undefined ){
        this.loc = loc;
    }
    this.id = id;
    this.pos = pos;
};
JSHC.TyCls.prototype.toString = function(){
    return "type class " + (this.loc===undefined ? "" : this.loc) + this.id;
};
JSHC.TyCls.prototype = new JSHC.Name();

////////////////////////////////////////////////////////////////////////////////

// no location parameter as they are never top-level names.
JSHC.TyVar = function(id,pos){
    this.name = "tyvar";
    this.id = id;
    this.pos = pos;
};
JSHC.TyVar.prototype.toString = function(){
    return "type variable " + this.id;
};
JSHC.TyVar.prototype = new JSHC.Name();

////////////////////////////////////////////////////////////////////////////////

JSHC.TyCon = function(id,pos,loc){
    this.name = "tycon";
    if( loc !== undefined ){
        this.loc = loc;
    }
    this.id = id;
    this.pos = pos;
};
JSHC.TyCon.prototype.toString = function(){
    return "type constructor " + (this.loc===undefined ? "" : this.loc) + this.id;
};
JSHC.TyCon.prototype = new JSHC.Name();

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
JSHC.DaCon.prototype.toString = function(){
    return "data constructor " + (this.loc===undefined ? "" : this.loc) + this.id;
};
JSHC.DaCon.prototype = new JSHC.Name();

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
JSHC.VarName.prototype.toString = function(){
    return "variable " + (this.loc===undefined ? "" : this.loc) + this.id;
};
JSHC.VarName.prototype = new JSHC.Name();

////////////////////////////////////////////////////////////////////////////////
