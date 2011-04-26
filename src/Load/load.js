
// requires assertions

if( JSHC.Load === undefined )JSHC.Load = {};

////////////////////////////////////////////////////////////////////////////////

JSHC.Load.syncLoadURL = function(url, params){
    var req = new XMLHttpRequest();
    req.open("GET", url, false); // waits until operation is complete.

    req.overrideMimeType('text/plain; charset=utf-8');
    params.forEach(function(param){
	req.setRequestHeader(param.header, param.value);
    });

    req.send(null);

    assert.ok( req.readyState === 4 );

    return req;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Load.asyncLoadURL = function(h0, url, params){
    var req = new XMLHttpRequest();
    req.open("GET", url, true);

    req.overrideMimeType('text/plain; charset=utf-8');
    params.forEach(function(param){
	req.setRequestHeader(param.header, param.value);
    });
    req.onreadystatechange = function() {

	// wait until operation is complete.
	if( req.readyState !== 4 )return;
	    
	h0(url, req);
    };

    req.send(null);
    return req;
};

////////////////////////////////////////////////////////////////////////////////

/*
  Returns a JSHC.Load.Module.
 */
JSHC.Load.syncLoadName = function(fileSystem, urls, prev){
    var modName;
    var i;

    if( prev instanceof JSHC.Load.Module ){
	modName = prev.name;
    } else if( typeof prev === "string" ){
	modName = prev;
	prev = JSHC.Load.Module.unread(modName);
    } else {
	throw new Error("invalid parameter");
    }

    const fileName = modName.replace(/\./g, "/") + ".hs";


    // try to find the module name in the file system
    if( fileSystem[modName] !== undefined ){
	return JSHC.Load.Module.done({
		name: modName,
		contents: fileSystem[modName],
		source: modName,
		date: null});
    }

    // iterate over the search path with URL prefixes.
    for(i=0;i<urls.length;i++){
	const prefix = urls[i];
	var url = prefix + fileName;

	var params = [];
	if( prev.source === url ){
	    params.push({header: "If-Modified-Since", value: prev.date});
	}

	try{
	    var req = JSHC.Load.syncLoadURL(url, params);
	} catch( err ){
	    this.onWarning("Could not initiate request: "+err);
	    continue; // try next source
	}

	// make sure the date is either 'null' or a non-0 length string.
	var date = req.getResponseHeader("Last-Modified");
	if( date === undefined ||
	    !(typeof date === "string") ||
	    date.length == 0 ){
	    date = null;
	}

	// check if using FILE protocol
	if( prefix.substring(0,7) === "file://" ){
	    return JSHC.Load.Module.done({
		    name: modName,
		    contents: req.responseText,
		    source: url,
		    date: date});
	}

	// handling HTTP response
	switch( req.status ){
	case 200: // ok
	return JSHC.Load.Module.done({
		name: modName,
		contents: req.responseText,
		source: url,
		date: date});

	case 204: // no response
	this.onWarning("No response when trying to read "+url);
	continue; // try next source
	
	case 304: // not modified
	assert.ok( prev.status === "success" || prev.status === "failure" );
	return prev;

	case 404: // not found
	this.onWarning("Module not found in any buffer or any of the "+
		       "URL search paths.");
	continue; // try next source

	default:
	this.onWarning("Unknown response from "+url+
		       ", got status="+req.status);
	continue; // try next source
	}
    }

    // since loop ended, the module was not found at any URL, so fail.
    return JSHC.Load.Module.missing(modName, "Module not found at any of the URLs.");
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Load.asyncLoadName = null; // TODO

////////////////////////////////////////////////////////////////////////////////

JSHC.Load.syncLoadNames = function(fileSystem, urls, rootNames, current){
    assert.ok( rootNames instanceof Array && rootNames.length > 0 );
    var remaining, loaded;

    loaded = {};
    remaining = [];

    rootNames.forEach(function(root){
	remaining.push(root);
    });

    // load modules
    while( remaining.length > 0 ){
	var name = remaining.pop();

	// skip if already loaded
	if( loaded[name] !== undefined ){
	    continue;
	}

	var mod;
	if( current !== undefined && current[name] !== undefined ){
	    mod = current[name];
	} else {
	    mod = new JSHC.Load.Module.unread(name);
	}

	// reload the module and get a new one
	mod = this.syncLoadName(fileSystem, urls, mod);
	assert.ok( mod instanceof JSHC.Load.Module );

	loaded[name] = mod;

	if( mod.status === "success" ){
	    mod.deps(function(d){remaining.push(d);});
	}
    }
    return loaded;
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Load.asyncLoadNames = null; // TODO

////////////////////////////////////////////////////////////////////////////////
