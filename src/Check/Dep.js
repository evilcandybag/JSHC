
if( JSHC.Dep === undefined ){
    JSHC.Dep = {};
}

////////////////////////////////////////////////////////////////////////////////

/*
  takes a list of entries and an action to perform for each dependency group.
 */
JSHC.Dep.check = function(entrylist, action){
    var entrymap = {};

    entrylist.forEach(function(entry){
            //alert(JSHC.showAST(entry.names));
	    for(var name in entry.names){
		entrymap[name] = entry;
	    }
	});

    entrylist = JSHC.Dep.condense(entrymap);

    JSHC.Dep.removeSelfDeps(entrymap);

    JSHC.Dep.transpose(entrymap);

    var t = new JSHC.Dep.traverse(entrymap, entrylist);

    while( !t.isDone() ){
	var e = t.takeOne();
	assert.ok( e !== undefined, "takeOne must return non-undefined when isDone is false" );
	//if( e == undefined )break;
	action(e);
	t.done(e);
    }
};

////////////////////////////////////////////////////////////////////////////////

JSHC.Dep.Graph = function(){
    this.entries = {}; // entries
    this.namemap = {}; // mapping from entry names to entries
};

/*
JSHC.Dep.Graph.condense = function(){
    this.entries = JSHC.condenseEntries(this.entries);

    // TODO: need to add ".ix" for each entry with the index of the entry
    //       in the entries list.
};
*/

JSHC.Dep.removeSelfDeps = function(entries){
    for(name in entries){
	var entry = entries[name];
        if( entry.ins[name] !== undefined ){
             delete entry.ins[name];
        }
    }
};

/*
  for each incoming edge (dependency), add an outgoing edge on the opposite
  entry.
 */
JSHC.Dep.transpose = function(entries){
    var name;

    for(name in entries){
	var entry = entries[name];

	if( entry.deps !== undefined ){
	    continue;
	}
	entry.deps = JSHC.numberOfKeys(entry.ins);
	//alert(JSHC.showAST(entry.ins));

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

    // Q: need a string-set for ins and outs ?

JSHC.Dep.traverse = function(entrymap, entrylist){
    this.entries = entrymap;
    this.waiting = {};
    this.ready = {};

    for(var i=0 ; i<entrylist.length ; i++){
	var key = entrylist[i].name;
	//alert(key+" has "+entrylist[i].deps+" deps");
	if( entrylist[i].deps === 0 ){
	    this.ready[key] = entrylist[i];
	} else {
	    this.waiting[key] = entrylist[i];
	}
    }

    //document.write("ready-set: "+JSHC.getKeys(this.ready)+"<br>");
    //document.write("waiting-set: "+JSHC.getKeys(this.waiting)+"<br>");

    /*
      var entry = this.notReady[i];

      if( entry.deps !== 0 ){
	    i++;
	    continue;
	    }
	this.notReady.splice(i,1);
	this.ready.push(entry);
    */
};
JSHC.Dep.traverse.prototype.takeOne = function(){
    // if ready list is empty, return undefined
    // if ready list is non-empty, return any element
    var k = undefined;

    for(k in this.ready){ // ready : map
	break;
    }
    if( k === undefined )return undefined;

    var entry = this.ready[k];
    delete this.ready[k];
    return entry;
};
JSHC.Dep.traverse.prototype.takeAll = function(){
    var es = [];
    while(true){
	var e = this.takeOne();
	if( e === undefined )break;
	es.push(e);
    }
    return es;
};
JSHC.Dep.traverse.prototype.done = function(entry){

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
	}
    }
};

JSHC.Dep.traverse.prototype.remaining = function(){
    var remaining = 0;
    for(var k in ready){
	remaining++;
    }
    for(var k in waiting){
	remaining++;
    }
    return remaining;
};


JSHC.Dep.traverse.prototype.isDone = function(){
    for(var k in this.ready){
	return false;
    }
    for(var k in this.waiting){
	return false;
    }
    return true;
};

/* Entries
* members
  * values: list of modules/topdecls/.. in this entry. initially length 1.

  * edges: list of names of other entries that this entry depends upon.
outs: entries that refer to this entry
ins: entries that the entry is referring to

  * names: ...
*/

// Entry constructor.
// entry of E
// values: list of E
// edges: list of string
JSHC.Dep.Entry = function(values,names,edges){
    this.values = values === undefined ? [] : values;

    this.name = names[0];
    this.names = {};
    for(var k=0; k<names.length; k++){
	this.names[names[k]] = null;
    }

    this.ins = {};

    for(var k=0; k<edges.length; k++){
	this.ins[edges[k]] = null;
    }

    //    this.ins = {};    // set of used names
    //    this.outs = {};   // set of used entry indices

    // initial data
    //    this.names = [];  // list of declared names
    //    this.values = []; // list of contained objects
};
JSHC.Dep.Entry.prototype.addIncoming = function(edge){
    if( this.names[edge] !== undefined ){
	return;
    }
    this.ins[edge] = null;
};
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

//JSHC.Dep.Graph.simplify = function(){
    // replace the list of used names with ins and outs.
    // ins: used entries. mapping from first name of entry to entry object.
    // outs: entries using this entry. mapping from first name to entry object.
//};

/*
 idea..

 * create entries from something, and then do "new Graph(entries)".
 * graph.simplify()
   makes the mapping from names to entries smaller.
   Q:not really necessary ?
 * graph.condense()
   merge entries.
   if doing the simplification, then the mapping from names to entries will
   only have one name for each entry.
 * graph.traverse()
   for each entry:
     entry.deps = entry.ins.size

*/

// condenses a graph by merging a subet of the nodes to create a DAG.
JSHC.Dep.condense = function(old_entries){
    assert.ok( old_entries instanceof Object );
    var eop = [];
    var ix,len;
    var i;
    var new_entries = [];

    // eop: entries on path
    // ce: current entry
    var condense = function(ce) {
	assert.ok( ce instanceof JSHC.Dep.Entry );

	//document.write("<p>start:<br>");
	//document.write("set: "+ce+"<br></p>");
	var edges;
	var ix,len;
	var dep;
	var merged_entry;

	// compute index of ce in eop
	if( eop.indexOf(ce) >= 0 ){ // if eop contains ce
	    //document.write("already in eop. merged.<br>");
	    // found a cycle. return and merge other entries into this entry.
	    ce.status = "merged";
	    new_entries.push(ce);
	    return ce;
	} else {
	    eop.push(ce);
	    //document.write("added. eop length: "+eop.length+"<br>");
	}

	edges = ce.ins;
	// these edges will be included into another entry if it is part of a
	// cycle, and then the loop continues to add the rest of the edges to
	// the merged entry.
	
	for(edge in edges){
	    //document.write("edge: "+edges[i]+"<br>");
	    dep = old_entries[edge];
	    // skips edge if it is to itself, or if already checked.
	    if( dep === ce || dep.status !== undefined ){
		// dep already checked, so NOT connected with ce.
		continue;
	    }
	    
	    // dependency is some other unchecked entry, so check it.
	    merged_entry = condense(dep);
	    //document.write("<p>continuing:<br>");
	    //document.write("ce: "+ce+"<br>");
	    //document.write("merged_entry: "+merged_entry+"<br></p>");
	    //document.write("dep: "+dep+"<br>");

	    assert.ok( dep.status !== undefined );

	    if( merged_entry === undefined ){
		assert.ok( dep.status !== "removed" );
		// dep now checked. found to be NOT connected with ce.
		continue;
	    }
	    if( merged_entry === ce ){
		assert.ok( dep.status === "removed" );
		//document.write("found beginning of cycle<br>");
		// this is the beginning of the cycle, so stop by returning
		// undefined.
		eop.pop();
		return undefined;
	    } else {
		// include 'ce' into 'merged_entry'.
		//document.write("including into merged entry<br>");
		if( ce.status === undefined ){
		    assert.ok( ce.values.length === 1 );
		    merged_entry.values.push(ce.values[0]);
		} else {
		    assert.ok( ce.status === "merged" );
		    for(var i=0;i<ce.values.length;i++)  // add all values
			merged_entry.values.push(ce.values[i]);
		}

		// add all edges
		(function(){
		    for(var edge in ce.ins){
			merged_entry.addIncoming(edge);
		    }
		})();

		// when merging an entry A into an entry B, then A should be
		// removed. simply refer to the merged entry instead.
		//new_entries[ce.name] = merged_entry;

		// move all names from ce to the merged_entry
		for(var name in ce.names){
		    //assert.ok( typeof name === "string" );
		    //assert.ok( merged_entry.names.indexOf(name) === -1 );
		    merged_entry.addName(name)
		    old_entries[name] = merged_entry;
		}
		//for(var oe in old_entries){
		//if( old_entries[oe] === ce ){
		//new_entries[oe] = merged_entry;
		// TODO: could keep a list of names in the entry,
		// and then add new names to this list when merging.
		//}
		//}
		
		// later on one might want to include the 'ce' into another
		// cycle, i.e merge the two cycles, so 'ce' must be referring
		// to the cycle ('merged_entry').
		ce.status = "removed";
		ce = merged_entry;
		continue;
	    }
	} // end of loop over dependencies/edges
	
	//document.write("<p>after edges:<br>");
	//document.write("set: "+ce+"<br></p>");
	if( ce.status === undefined ){
	    // if status has not been set, then it is not part of any cycle.
	    ce.status = "single"
	    new_entries.push(ce);

	    eop.pop();
	    return undefined;
	} else {
	    // if status was set, then it must have been part of a cycle,
	    // so the status must have been set to merged.
	    assert.ok( ce.status === "merged", "status was "+ce.status );

	    eop.pop();
	    return ce;
	}
    }

    //for(ix=0, len=old_entries.length; ix<len; ix++){
    for(var oe in old_entries){
	if( old_entries[oe].status !== undefined ){
	    continue;
	}
	condense(old_entries[oe]);  //condense(eop,old_entries[ix]);
	assert.ok( eop.length === 0 );
    }

    return new_entries;
};

