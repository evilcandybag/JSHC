
if( JSHC.Dep === undefined ){
    JSHC.Dep = {};
}

////////////////////////////////////////////////////////////////////////////////

/*
  Takes a list of entries and an action to perform for each dependency group.
*/
JSHC.Dep.check = function(entrylist, action){
    var entrymap = {};

    entrylist.forEach(function(entry){
	    for(var name in entry.names){
		entrymap[name] = entry;
	    }
	});

    entrylist = JSHC.Dep.condense(entrymap);

    JSHC.Dep.removeSelfDeps(entrymap);

    JSHC.Dep.transpose(entrymap);

    var t = new JSHC.Dep.Traverse(entrymap, entrylist);

    while( !t.isDone() ){
	var e = t.takeOne();
	assert.ok( e !== undefined, "takeOne must return non-undefined when isDone is false" );
	action(e);
	t.done(e);
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  Removes dependencies to itself from entries.
*/
JSHC.Dep.removeSelfDeps = function(entries){
    for(name in entries){
	var entry = entries[name];
        if( entry.ins[name] !== undefined ){
             delete entry.ins[name];
        }
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  For each incoming edge (dependency), add an outgoing edge on the opposite
  entry. This is needed for the traversal.
*/
JSHC.Dep.transpose = function(entries){
    var name;

    for(name in entries){
	var entry = entries[name];

	if( entry.deps !== undefined ){
	    continue;
	}
	entry.deps = JSHC.numberOfKeys(entry.ins);

	// create outgoing edges for all incoming edges
	for(var inEdge in entry.ins){
	    // add outgoing edge
	    //assert.ok( this.namemap[inEdge].names.indexOf(inEdge) !== -1 );
	    if( entries[inEdge].outs === undefined ){
		entries[inEdge].outs = {};
	    }
	    entries[inEdge].outs[entry.name] = null;
	}
    }
};

////////////////////////////////////////////////////////////////////////////////

/*
  Constructor of an object that is used to traverse the graph in dependency
  order.
*/
JSHC.Dep.Traverse = function(entrymap, entrylist){
    this.entries = entrymap;
    this.waiting = {};
    this.ready = {};

    for(var i=0 ; i<entrylist.length ; i++){
	var key = entrylist[i].name;
	if( entrylist[i].deps === 0 ){
	    this.ready[key] = entrylist[i];
	} else {
	    this.waiting[key] = entrylist[i];
	}
    }
};

/*
  Take one entry from the ready set.
  If the ready set is empty, undefined is returned.
*/
JSHC.Dep.Traverse.prototype.takeOne = function(){
    var k = undefined;

    for(k in this.ready){ // ready : map
	break;
    }
    if( k === undefined )return undefined;

    var entry = this.ready[k];
    delete this.ready[k];
    return entry;
};

/*
  Take all entries from the ready set.
*/
JSHC.Dep.Traverse.prototype.takeAll = function(){
    var es = [];
    while(true){
	var e = this.takeOne();
	if( e === undefined )break;
	es.push(e);
    }
    return es;
};

/*
  Return an entry that was taken out.
*/
JSHC.Dep.Traverse.prototype.done = function(entry){

    for(var out in entry.outs){
	// for each of the entries (in the waiting list) exported to:
	// decrease number of imports.
	// if reaching zero, then move from the waiting set to ready set.
	this.entries[out].deps--;
	assert.ok( this.entries[out].deps >= 0 );
	if( this.entries[out].deps === 0 ){
	    assert.ok( this.waiting[out] !== undefined );
	    this.ready[out] = this.waiting[out];
	    delete this.waiting[out];
	    delete this.entries[out].deps;
	}
    }
};

/*
  Return the number of remaining entries.
*/
JSHC.Dep.Traverse.prototype.remaining = function(){
    var remaining = 0;
    for(var k in ready){
	remaining++;
    }
    for(var k in waiting){
	remaining++;
    }
    return remaining;
};

/*
  Return true if and only if the traversal is done.
*/
JSHC.Dep.Traverse.prototype.isDone = function(){
    for(var k in this.ready){
	return false;
    }
    for(var k in this.waiting){
	return false;
    }
    return true;
};

////////////////////////////////////////////////////////////////////////////////

/*
  Entry constructor.
  Takes list of values, list/set of names, and list/set of edges.

  contains:
    values: any objects. this is e.g modules or topdecls.
    names: declared names. strings. e.g module/topdecl name.
    edges: used names. strings. e.g used names in an expression.

  build internally:
    outs: entries that refer to this entry
    ins: entries that the entry is referring to
*/
JSHC.Dep.Entry = function(values,names,edges){
    assert.ok( values instanceof Array, "values is "+values );

    // initialize "values"
    this.values = values;

    // initialize "names"
    this.name = names[0];
    this.names = {};
    if( edges instanceof Array ){
        for(var k=0 ; k<names.length ; k++){
	    this.names[names[k]] = null;
        }
    } else {
        for(var k in names){
	    this.names[names[k]] = null;
        }
    }

    // initialize "ins"
    this.ins = {};
    if( edges instanceof Array ){
        for(var k=0 ; k<edges.length ; k++){
	    this.ins[edges[k]] = null;
        }
    } else {
        for(var k in edges){
	    this.ins[edges[k]] = null;
        }
    }
};

/*
  Used to merge entries when condensing the graph.
*/
JSHC.Dep.Entry.prototype.addIncoming = function(edge){
    if( this.names[edge] !== undefined ){
	return;
    }
    this.ins[edge] = null;
};

/*
  Used to merge entries when condensing the graph.
*/
JSHC.Dep.Entry.prototype.addName = function(name){
    this.names[name] = null;   // add name
    delete this.ins[name];
};

JSHC.Dep.Entry.prototype.toString = function(){
    var d = ["{"];
    for(var name in this.names){
	    d.push(name);
	    d.push(", ");
    }
    d.pop();
    d.push("}");
    return d.join("");
};

////////////////////////////////////////////////////////////////////////////////

/*
  Condenses a graph by merging some nodes to create a directed acyclic graph.
  Takes a mapping from names to entries. Each entry may have multiple names.

  The function updates the map to remove old entries (and replace it with what
  it was merged into), and returns a list of the remaining entries.
*/
JSHC.Dep.condense = function(old_entries){
    assert.ok( old_entries instanceof Object );

    // eop: entries on path
    var eop = [];
    // list of the remaining entries. entries that are done are added.
    var new_entries = [];

    // ce: current entry
    var condense = function(ce) {
	assert.ok( ce instanceof JSHC.Dep.Entry );

	var merged_entry;

	// compute index of ce in eop
	if( eop.indexOf(ce) >= 0 ){ // if eop contains ce
	    // found a cycle. return and merge other entries into this entry.
	    ce.status = "merged";
	    new_entries.push(ce);
	    return ce;
	} else {
	    eop.push(ce);
	}

	// the edges will be included into another entry if it is part of a
	// cycle, and then the loop continues to add the rest of the edges to
	// the merged entry.
	for(var depname in ce.ins){
	    dep = old_entries[depname];
	    assert.ok( dep !== undefined, "missing dependency of an entry: "+depname);

	    //JSHC.alert("depname: ",depname,"\nentry: ",dep,"\nnames: ",ce.names,"\ndeps: ",ce.ins);

	    // skips edge if it is to itself, or if already checked.
	    if( dep === ce || dep.status !== undefined ){
		// dep already checked, so NOT connected with ce.
		continue;
	    }
	    
	    // dependency is some other unchecked entry, so check it.
	    merged_entry = condense(dep);
	    assert.ok( dep.status !== undefined );

            // check if 'dep' connected with 'ce'.

	    if( merged_entry === null ){
		assert.ok( dep.status !== "removed" );
		// found to be NOT connected with 'ce'.
		continue;
	    }

            // check for beginning of cycle
	    if( merged_entry === ce ){
		assert.ok( dep.status === "removed" );
		// found beginning of cycle.
		// stop merging by returning null.
		eop.pop();
		return null;
	    } else {
		// merge 'ce' into 'merged_entry'.
                assert.ok( ce.status === undefined || ce.status === "merged" );

                // add all values
		for(var ix=0 ; ix<ce.values.length ; ix++){
		    merged_entry.values.push(ce.values[ix]);
                }

		// add all edges
		for(var edge in ce.ins){
		    merged_entry.addIncoming(edge);
		}

		for(var name in ce.names){
		    // add all names
		    merged_entry.addName(name)

		    // when merging an entry A into an entry B, then A must be
		    // removed by referring to the merged entry instead.
		    // do this by moving all names from ce to the merged_entry.
		    // this affects the loop over dependencies, as one would not
		    // want to access old entries.
		    old_entries[name] = merged_entry;
		}
		
		// later on one might want to include the 'ce' into another
		// cycle, i.e merge the two cycles, so 'ce' must be referring
		// to the cycle ('merged_entry').
		ce.status = "removed";
		ce = merged_entry;
		continue;
	    }
	} // end of loop over dependencies/edges
	
	if( ce.status === undefined ){
	    // if status has not been set, then it is not part of any cycle.
	    ce.status = "single"
	    new_entries.push(ce);

	    eop.pop();
	    return null;
	} else {
	    // if status was set, then it must have been part of a cycle,
	    // so the status must have been set to merged.
	    assert.ok( ce.status === "merged", "status was "+ce.status );

	    eop.pop();
	    return ce;
	}
    }

    for(var oe in old_entries){
	if( old_entries[oe].status !== undefined ){
	    continue;
	}

	condense(old_entries[oe]);
	assert.ok( eop.length === 0 );
    }

    return new_entries;
};

////////////////////////////////////////////////////////////////////////////////
