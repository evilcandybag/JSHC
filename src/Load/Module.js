
// requires assertions

if( JSHC.Load === undefined )JSHC.Load = {};

////////////////////////////////////////////////////////////////////////////////

/*
  Module objects must never be changed. considered immutable.

  status = "success"/"failure"/"missing"/"unread"

  if status is unread:
    name : string

  if status is missing:
    name : string
    err : string

  if status is failure:
    name : string
    contents : string
    source : string
    date : string
    err : ParseError

  if status is success:
    name : string
    contents : string
    source : string
    date : string
    ast : AST

  description of common fields:
    name: module name
    contents: file contents
    source: source of contents. URL or the module name (iff local).
    date: date string when last modified, or null if unknown.
*/

JSHC.Load.Module = function(){
    assert.ok( arguments.length === 0 );
};

/*
  Get module dependencies.
  Returns an Array of module names (strings).
 */
JSHC.Load.Module.prototype.deps = function(handler){
    assert.ok( this.status === "success" );

    var is;
    var impdecls = this.ast.body.impdecls;
    if( handler instanceof Function ){
	impdecls.forEach(function(impdecl){
	    handler(impdecl.modid.id);
	});
	return undefined;
    } else {
	is = [];
	impdecls.forEach(function(impdecl){
	    is.push(impdecl.modid.id);
	});
	return is;
    }
};

JSHC.Load.Module.done = function(name, contents, source, date){
    var m = new JSHC.Load.Module();

    if( typeof name === "string" ){
	m.name = name;
	m.contents = contents;
	m.source = source;
	m.date = date;
    } else {
	var obj = name;
	m.name = obj.name;
	m.contents = obj.contents;
	m.source = obj.source;
	m.date = obj.date;
    }

    // TODO:
    // compute flags by reading the first line or something from the file.
    m.flags = [];

    try {
	m.ast = JSHC.parse(m.contents);
    } catch(err){
	if( err instanceof JSHC.ParseError ){
	    m.status = "failure";
	    m.err = err;
	    return m;
	} else {
	    throw err;
	}
    }

    if( m.name !== m.ast.modid.id ){
        m.status = "failure";
        m.err = "module name \""+m.ast.modid.id+"\" does not match file name \""+m.name+"\"";
        return m;
    }

    m.status = "success";
    return m;
};

JSHC.Load.Module.missing = function(name, err){
    var m = new JSHC.Load.Module();
    m.status = "missing";
    m.name = name;
    m.err = err;
    return m;
};

JSHC.Load.Module.unread = function(name){
    assert.ok( typeof name == "string" );
    var m = new JSHC.Load.Module();
    m.status = "unread";
    m.name = name;
    return m;
};

////////////////////////////////////////////////////////////////////////////////
