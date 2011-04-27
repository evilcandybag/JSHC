
if( JSHC.Dep === undefined ){
    JSHC.Dep = {};
}

////////////////////////////////////////////////////////////////////////////////

JSHC.Dep.Graph = function(){
    this.entries = {}; // mapping from entry names to entries
    this.condense = function(){
	this.entries = JSHC.condenseEntries(this.entries);
    }
};

/* Entries
* members
  * values: list of modules/topdecls/.. in this entry. initially length 1.
  * edges: list of names of other entries that this entry depends upon.
  * names: ...
*/

// Entry constructor.
// entry of E
// values: list of E
// edges: list of string
JSHC.Dep.Entry = function(values,names,edges){
    this.values = values === undefined ? [] : values;
    this.names = names === undefined ? [] : names;
    this.edges = edges === undefined ? [] : edges;
};
JSHC.Dep.Entry.prototype.toString = function(){
    var d = ["{"];
    this.names.forEach(function(n){
	    d.push(n);
	    d.push(", ");
	});
    d.pop();
    d.push("}");
    return d.join("");
};

// condenses a graph by merging a subet of the nodes to create a DAG.
JSHC.Dep.condense = function(old_entries){
    assert.ok( old_entries instanceof Object );
    var eop = [];
    var ix,len;
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

	edges = ce.edges;
	// this list will never be modified while looping, as it is only modified
	// if the entry status is set to "merged" (as edges are added to the entry).
	// see above.
	// these edges will be included into another entry if it is part of a
	// cycle, and then the loop continues to add the rest of the edges to
	// the merged entry.
	
	for(i=0,len=edges.length; i<len; i++){
	    //document.write("edge: "+edges[i]+"<br>");
	    dep = old_entries[edges[i]];
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
		for(var i=0;i<ce.edges.length;i++){  // add all edges
		    merged_entry.edges.push(ce.edges[i]);
		    //document.write("adding edge "+ce.edges[i]+"<br>");
		}
		
		// when merging an entry A into an entry B, then A should be
		// removed. simply refer to the merged entry instead.
		//new_entries[ce.name] = merged_entry;

		// move all names from ce to the merged_entry
		for(var name=0;name<ce.names.length;name++){
		    //assert.ok( typeof name === "string" );
		    //assert.ok( merged_entry.names.indexOf(name) === -1 );
		    merged_entry.names.push(ce.names[name]);
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

