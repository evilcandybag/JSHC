
////////////////////////////////////////////////////////////////////////////////

/*
    param1: optional. stores values if true, else stores null.
    param2: optional. name of show function for keys. defaults to "toString".
*/
JSHC.Set = function(storeValues,opt_toString){
    if( typeof storeValues == "boolean" ){
        this.storeValues = storeValues;
    } else {
        this.storeValues = true;
    }
    if( opt_toString !== undefined ){
        this.toString = opt_toString;
    } else {
        this.toString = "toString";
    }
    this.obj = {};
};

JSHC.Set.prototype.add = function(name){
    this.obj[name[this.toString]()] = this.storeValues ? name : null;
};

/*
  If already in the set, the handler is called with the previous element.
*/
JSHC.Set.prototype.addUnique = function(name,handler){
    var key = name[this.toString]();
    if( this.obj[key] === undefined ){
        this.obj[key] = this.storeValues ? name : null;
    } else {
        handler(this.obj[key]);
    }
};

JSHC.Set.prototype.rem = function(name){
    delete this.obj[name[this.toString]()];
};

JSHC.Set.prototype.lookup = function(name){
    return this.obj[name[this.toString]()];
};

JSHC.Set.prototype.getObject = function(){
    return this.obj;
};

JSHC.Set.prototype.getAny = function(){
    for(var k in this.obj){
        return this.obj[k];
    }
};

JSHC.Set.prototype.getKeys = function(){
    var keys = [];
    for(var k in this.obj){
        keys.push(k);
    }
    return keys;
};

JSHC.Set.prototype.getValues = function(){
    assert.ok( this.storeValues, "no values stored" );
    var values = [];
    for(var k in this.obj){
        values.push(this.obj[k]);
    }
    return values;
};

JSHC.Set.prototype.size = function(){
    return JSHC.numberOfKeys(this.obj);
};

////////////////////////////////////////////////////////////////////////////////
