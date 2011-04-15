// -----------------------------------------------------------------------------
// showing AST

JSHC.showAST = (function(){
	var showAST = function(ast){
	    var sb = [];  // a list as a string buffer/builder
	    showAST2(sb,ast);
	    return sb.join("");
	};

	var showAST2 = function(sb,ast){
	    if( typeof ast === "string" ){
		sb.push("\"" + ast.toString() + "\"");
	    } else if( typeof ast === "number" ){
		sb.push(ast.toString());
	    } else if( typeof ast === "boolean" ){
		sb.push(ast.toString());
	    } else if( ast instanceof Array ){
		sb.push("[");
		sb.push(showNode(sb,ast));
		sb.push("]");
	    } else if( ast instanceof Object ){
		//        if (typeof ast.toString === "function") {
		//            sb.push(ast.toString());
		//        } else {
		sb.push("{");
	        for(k in ast){
	            sb.push(k+": ");
	            //if( k==="rhs" )document.write("yy"+ast[k] +"<br>");
	            showAST2(sb,ast[k]);
	            //document.write(s +"<br>");
	            sb.push(", ");
	        }
	        sb.pop();
	        sb.push("}");
		//	    }
	    } else if( ast === null ){ // typeof null === "object"
	        sb.push("null");
	    } else {
		throw new Error("unhandled case: "+typeof ast);
	    }
	    //return "(" + typeof ast + ast.toString() + ")";
	};

	var showNode = function(sb,l){
	    if ( l.length == 0 ) {
		return;
	    }
	    //document.write(s +"<br>");
	    showNodeNE(sb,l);
	};

	var showNodeNE = function(sb,l){
	    for(var i=0 ; i<l.length-1 ; i=i+1){
		showAST2(sb,l[i]);
		sb.push(", ");
	    }
	    //document.write(s +"<br>");
	    showAST2(sb,l[l.length-1]);
	}

	return showAST;
    })();

// -----------------------------------------------------------------------------
