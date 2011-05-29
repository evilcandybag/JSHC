
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


(function(){
    var _switchToBuffer = Ymacs.prototype.switchToBuffer;
    Ymacs.prototype.switchToBuffer = function(){
	var buf = _switchToBuffer.apply(this,arguments);

        var ext = buf.name.substr(buf.name.lastIndexOf("."));
	if( ext == ".hs" ){
	    var ef = function(){};
	    var dummystate = {onWarning:ef,onMessage:ef,onError:ef};
	    var mod = JSHC.Load.syncLoadName.call(dummystate,
	               {},
	               JSHC.Compiler.getDefaultPath(),
	               new JSHC.Load.Module.unread(buf.name.substr(0,buf.name.length-3)));

	    if( mod.status === "success" && typeof mod.contents == "string" ){
                if( buf.code === undefined || buf.code == "" ){
	            buf._insertText(mod.contents);
	        }
	    }
	}

	return buf;
    };
})();

////////////////////////////////////////////////////////////////////////////////
