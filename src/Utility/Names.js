
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
};

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
JSHC.ModName.prototype.toStringV = function(){
    return "module " + this.toStringQ();
};
JSHC.ModName.prototype.toString = JSHC.ModName.prototype.toStringN;

JSHC.ModName.prefixes = function(id){
    var prefixes = [];

    var startix = 0;
    while(true){
        var endix = id.indexOf(".", startix);
        if( endix === -1 ){
            prefixes.push(id);
            break;
        }
        prefixes.push(id.substr(startix,endix));
        startix = endix + 1;
    }
    return prefixes;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.TyCls = function(id,pos,loc){
    this.name = "tycls";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
    }
    this.id = id;
    this.pos = pos;
};
JSHC.TyCls.prototype = new JSHC.Name();
JSHC.TyCls.prototype.toStringN = function(){
    return this.id;
};
JSHC.TyCls.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc+".") + this.toStringN();
};
JSHC.TyCls.prototype.toStringV = function(){
    return "type class " + this.toStringQ();
};
JSHC.TyCls.prototype.toString = JSHC.TyCls.prototype.toStringN;

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
JSHC.TyVar.prototype.toStringV = function(){
    return "type variable " + this.toStringQ();
};
JSHC.TyVar.prototype.toString = JSHC.TyVar.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

JSHC.TyCon = function(id,pos,loc){
    this.name = "tycon";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
    }
    this.id = id;
    this.pos = pos;
};
JSHC.TyCon.prototype = new JSHC.Name();
JSHC.TyCon.prototype.toStringN = function(){
    return this.id;
};
JSHC.TyCon.prototype.toStringQ = function(){
    return (this.loc===undefined ? "" : this.loc+".") + this.toStringN();
};
JSHC.TyCon.prototype.toStringV = function(){
    return "type constructor " + this.toStringQ();
};
JSHC.TyCon.prototype.toString = JSHC.TyCon.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

JSHC.DaCon = function(id,pos,isSymbol,loc){
    assert.ok( typeof isSymbol === "boolean" );
    this.name = "dacon";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
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
    var qid = this.loc===undefined ? this.id : this.loc+"."+this.id;
    return (this.isSymbol ? "("+qid+")" : qid);
};
JSHC.DaCon.prototype.toStringV = function(){
    return "data constructor " + this.toStringQ();
};
JSHC.DaCon.prototype.toString = JSHC.DaCon.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////

JSHC.VarName = function(id,pos,isSymbol,loc){
    assert.ok( typeof isSymbol === "boolean" );
    this.name = "varname";
    if( loc !== undefined ){
        this.loc = loc;
        if( id.substr(0,loc.length) == loc ){
            id = id.substr(loc.length+1);
        }
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
    var qid = this.loc===undefined ? this.id : this.loc+"."+this.id;
    return (this.isSymbol ? "("+qid+")" : qid);
};
JSHC.VarName.prototype.toStringV = function(){
    return "variable " + this.toStringQ();
};
JSHC.VarName.prototype.toString = JSHC.VarName.prototype.toStringN;

////////////////////////////////////////////////////////////////////////////////
