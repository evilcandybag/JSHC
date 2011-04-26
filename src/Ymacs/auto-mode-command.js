
////////////////////////////////////////////////////////////////////////////////

Ymacs_Buffer.newCommands({

	auto_mode: Ymacs_Interactive_X(function(){
		var buf = this.whenYmacs(function(ymacs){
			return ymacs.getActiveBuffer();
		    });
		var ext = buf.name.substr(buf.name.lastIndexOf("."));
		var mode;
		switch( ext ){
		case ".hs": mode = "haskell_mode";   break;
		case ".lisp": mode = "lisp_mode";    break;
		case ".html": mode = "xml_mode";     break;
		case ".js": mode = "javascript_mode"; break;
		default: mode = null;
		}
		
		if( mode === null ){
		    buf.signalError("no mode for " + ext.bold(), true);
		} else {
		    buf.cmd(mode);
		    buf.signalInfo("setting "+mode);
		}
	})
});

////////////////////////////////////////////////////////////////////////////////
