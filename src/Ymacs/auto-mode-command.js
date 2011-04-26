
////////////////////////////////////////////////////////////////////////////////

Ymacs_Buffer.newCommands({

	auto_mode: Ymacs_Interactive_X(function(){
		var ext = this.name.substr(this.name.lastIndexOf("."));
		var mode;
		switch( ext ){
		case ".hs": mode = "haskell_mode";   break;
		case ".lisp": mode = "lisp_mode";    break;
		case ".html": mode = "xml_mode";     break;
		case ".js": mode = "javascript_mode"; break;
		default: mode = null;
		}
		
		if( mode === null ){
		    //this.signalError("no mode for " + ext.bold(), true);
		} else {
		    this.cmd(mode);
		    //console.log("setting "+mode+" for "+this.name);
		    //this.signalInfo("setting "+mode);
		}
	})
});

////////////////////////////////////////////////////////////////////////////////

/*
  Replace the createBuffer method with one that runs the auto mode after
  creating a new buffer.
 */
(function(){
    var _createBuffer = Ymacs.prototype.createBuffer;
    Ymacs.prototype.createBuffer = function(){
	var buf = _createBuffer.apply(this,arguments);
	buf.cmd("auto_mode");
	return buf;
    };
})();

////////////////////////////////////////////////////////////////////////////////
