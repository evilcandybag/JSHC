
if( JSHC.Ymacs === undefined )JSHC.Ymacs = {};

////////////////////////////////////////////////////////////////////////////////

// NOTE:
// since there is only a single interpreter buffer, there only needs to be a
// single interpreter.
// if one allows several interpreter buffers, then one must create a new
// interpreter for each interpreter buffer, and make sure that the prefix of
// compiled code is unique.
JSHC.Ymacs.interpreter = new JSHC.Interpreter("JSHC.modules.");

////////////////////////////////////////////////////////////////////////////////
