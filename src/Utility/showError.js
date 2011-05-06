
/*
  returns a nice string representation of something that has been caught in a
  catch-clause.
  the parameter must be defined.
*/
JSHC.showError = function(err){
  assert.ok( err !== undefined, "parameter must be defined" );

  if( !(err instanceof Error) ){
      return "not an instance of Error:\n" + err;
  } else {  // instance of Error
    var error_text;

    // the toString() method should exist and give a long description.
    if( err.toString !== undefined ){
        error_text = err.toString().trim() + "\n\n";
    } else {
        error_text = "";
    }

    // test for common subclasses of Error so that one can add more
    // information in these cases, or just check for specific members.

    // ".message" exists in Error class, so should also exist in all subclasses.
    // this should be a short description.
    if( err.message !== undefined &&
        err.message instanceof String &&
        error_text.indexOf(err.message) === -1 ){
        error_text = "message: "+err.message+"\n"+error_text;
    }

    // if name exists, use it.
    if( err.name !== undefined &&
        err.name instanceof String &&
        error_text.indexOf(err.name) === -1 ){
        error_text = "name: "+err.name+"\n"+error_text;
    }

    // if the browser has a stack trace available and not already in the text
    // from toString(), then show it.
    if( err.stack !== undefined ){
        var trace = printStackTrace({e : err});
        error_text = error_text + "trace:\n\n" + trace.join('\n\n');
    }
  }
  return error_text;
};

