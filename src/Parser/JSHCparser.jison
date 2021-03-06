/*  
    Grammar specification for JSHC-parser. 
    Rules are sorted under their corresponding chapter
    in the Haskell 2010 Report, for readability and 
    overview. If a rule is present in several chapters 
    in the report, it is sorted under the first chapter
    it appears. 
*/

/* operator associations and precedence */

//%left '+' '-'
//%left '*' '/'
//%left '^'
//%right '!'
//%right '%'
//%left OP
//%left LEFT
//%left "::"
//%left exp
//%left infixexp
//%left infixexp_inner
//%left "in"
//%left lexp
//%left decls
//%left decl
//%left fexp
//%left aexp
%nonassoc  prec_infixexp
%nonassoc  NOSIGNATURE     // lower than "::"
%nonassoc  INFIXEXP        // lower than varsym, qconop, qvarsym, "`"
//%nonassoc  VAR

%nonassoc  varsym
%nonassoc  qconop
%nonassoc  qvarsym
%nonassoc  "`"
%nonassoc  "="
%nonassoc  ","
%nonassoc  "::"

%start start_
%error-verbose
%debug
%%

start_
    : module_ EOF    { return $1; }
    ;

////////////////////////////////////////////////////////////////////////////////
// 5.1 Module Structure

module_ // : object
  : "module" modid "where" body
       {{$$ = {name: "module", modid: $2, body: $4, pos: @$}; }}
  | "module" modid '(' exports ')' "where" body
       {{$$ = {name: "module", modid: $2, exports: $4, body: $7, pos: @$}; }}
  | body
      {{$$ = {name: "module", modid: new JSHC.ModName("Main"), body: $1, pos:@$}; }}
         // no modid since missing. defaults to 'Main'.
         // no exports since missing. everything exported.
  ;

// To avoid a lookahead > 1, we allow parsing of intermingled imports and other
// top-level declarations, but perform a post-check that enforces that there are
// no imports after the first other declaration.  
body // : object
  : '{' topdecls '}'    
        {{ 
        var imps = [], decs = [], atdecs = false;
        for (var i = 0; i < $2.length; i++) {
            if ($2[i].name == "impdecl" && !atdecs) {
                imps.push($2[i]);
            } else if ($2[i].name == "impdecl" && atdecs) {
                throw new JSHC.ParseError("import declaration in statement block at line " + $2[i].pos.first_line ,$2[i].pos,"import declaration in statement block");
            } else {
                atdecs = true;
                decs.push($2[i]);
            }
        }
        
        // add Prelude as an import if not explicitly imported
        var prelude_imported = false;
        for(i=0 ; i<imps.length ; i++){
	    if( imps[i].modid == "Prelude" ){
	        prelude_imported = true;
	        break;
            }
        }
        if( ! prelude_imported ){
            imps.push({name: "impdecl", modid: new JSHC.ModName("Prelude")});
        }

        $$ = {name: "body", impdecls: imps, topdecls: decs, pos:@$}; }}
  |   {{$$ = {name: "body", impdecls: [], topdecls: [], pos:@$}; }}
  ;
  
topdecls // : [topdecl]
  : topdecls_nonempty                 {{ $$ = $1; }}
  ;
  
topdecls_nonempty // : [topdecl]
  : topdecls_nonempty ";" topdecl     {{ $1.push($3); $$ = $1; }}
  | topdecl                           {{ $$ = [$1]; }}
  ;

////////////////////////////////////////////////////////////////////////////////
/* 4 Declarations and Bindings */

topdecl // : object
    : decl                          {{$$ = {name: "topdecl-decl", decl: $1, pos: @$};}}
    | "data" simpletype             {{$$ = {name: "topdecl-data", typ: $2, constrs: [], pos: @$};}}
    | "data" simpletype "=" constrs {{$$ = {name: "topdecl-data", typ: $2, constrs: $4, pos: @$};}}
    | impdecl                       {{$$ = $1;}}
    ;


decls // : [decl]
  : '{' '}'                           {{ $$ = []; }}
  | '{' list_decl_comma_1 '}'         {{ $$ = $2; }}
  | '{' error '}'                        {{ $$ = []; }}
  | '{' list_decl_comma_1 error '}'      {{ $$ = $2; }}
  ;

list_decl_comma_1 // : [decl]
  : list_decl_comma_1 ";" decl        {{ ($1).push($3); $$ = $1; }}
  | decl                              {{ $$ = [$1]; }}
  ;

//decl // : object
//  : funlhs rhs          {{$$ = {name: "decl-fun", lhs: $1, rhs: $2, pos:@$};}}
    //| pat rhs
//  | gendecl
//  ;
decl // : object
  : decl_fixity           {{$$ = $1;}}
  | var rhs           {{$$ = {name:"decl-fun", ident: $1, args: [], rhs: $2, pos: @$};}}
  | var apats rhs     {{$$ = {name:"decl-fun", ident: $1, args: $2, rhs: $3, pos: @$};}}
  | pat varop pat rhs {{$$ = {name:"decl-fun", ident: $2, args: [$1,$3], rhs: $4, pos: @$, orig: "infix"};}}
  | '(' pat varop pat ')' apats rhs
    {{$$ = {name:"decl-fun", ident: $3, args: [$2,$4].concat($6), rhs: $7, pos: @$, orig: "infix"};}}
  | var "::" type           {{$$ = {name:"type-signature",vars:[$1],sig:$3,pos:@$};}}
  | var "," vars "::" type  {{$$ = {name:"type-signature",vars:[$1].concat($3),sig:$5,pos:@$};}}
  ;

//funlhs // : object
//    : var apats       {{$$ = {name: "fun-lhs", ident: $1, args: $2, pos: @$};}}
//    | var             {{$$ = {name:"fun-lhs", ident: $1, args: [], pos: @$};}}
//  | pat varop pat
//    ;

rhs // : object
    : '=' exp                  {{$$ = $2;}}
    | '=' exp "where" decls    {{$$ = {name: "fun-where", exp: $2, decls: $4, pos: @$}; }}
    ; //TODO

decl_fixity // : type declaration | fixity
    : "infixl" literal op_list_1_comma  {{ $$ = {name: "fixity", fix: "leftfix", num: $2, ops: $3, pos: @$}; }}
    | "infixr" literal op_list_1_comma  {{ $$ = {name: "fixity", fix: "rightfix", num: $2, ops: $3, pos: @$}; }}
    | "infix" literal op_list_1_comma   {{ $$ = {name: "fixity",  fix: "nonfix",num: $2, ops: $3, pos: @$}; }}
    ;

simpletype // : object
    : tycon         {{$$ = {name: "simpletype", tycon: $1, vars: [], pos: @$};}}
    | tycon tyvars  {{$$ = {name: "simpletype", tycon: $1, vars: $2, pos: @$};}}
    ;

constrs // : [constr]
    : constrs "|" constr        {{$1.push($3); $$ = $1;}}
    | constr                    {{$$ = [$1];}}
    ;

constr // : object
    : con
        {{$$ = {name: "constr", dacon: $1, types: [], pos: @$};}}
    | con atypes
        {{$$ = {name: "constr", dacon: $1, types: $2, pos: @$};}}
    ;

atypes // : [atype]
    : atypes atype      {{$1.push($2); $$ = $1;}}
    | atype             {{$$ = [$1];}}
    ;

////////////////////////////////////////////////////////////////////////////////
// 5.2 Export Lists

exports // : [export]
    : exports_inner         {{$$ = $1;}}
    | exports_inner ','     {{$$ = $1;}}
    ;

exports_inner // : [export]
    : exports_inner ',' export      {{$1.push($3); $$ = $1;}}
    | export                        {{$$ = [$1];}}
    ;

export // : object
    : qvar
        {{$$ = {name: "export-qvar", exp: $1, pos: @$};}}
    | "module" modid 
        {{$$ = {name: "export-module", exp: $2, pos: @$};}}
    | qtycon
        {{$$ = {name: "export-type-unspec", exp: $1, pos: @$};}}
    | qtycon '(' ".." ')'
        {{$$ = {name: "export-type-all", exp: $1, pos: @$};}}
    | qtycon '(' list_cname_0_comma ')'
        {{$$ = {name: "export-type-vars", exp: $1, vars: $3, pos: @$};}}
    ; //TODO: export types and classes

////////////////////////////////////////////////////////////////////////////////
// 5.3 Import Declarations

impdecl // : object
    : "import" modid
        {{$$ = {name: "impdecl", modid: $2, pos: @$};}}
    | "import" modid '(' imports ')'
        {{$$ = {name: "impdecl", modid: $2, hiding: false, imports: $4, pos: @$};}}
    | "import" modid "hiding" '(' imports ')'
        {{$$ = {name: "impdecl", modid: $2, hiding: true, imports: $5, pos: @$};}}
    ; //TODO: qualified and renamed imports
/*
impspec // : object
    : '(' imports ')'
        {{$$ = {name: "impspec", imports: $2, pos: @$};}}
    | "hiding" '(' imports ')'
        {{$$ = {name: "impspec-hiding", imports: $3, pos: @$};}}
    ;
*/
imports // : [import]
    : list_import_1_comma         {{$$ = $1;}}
    | list_import_1_comma ','     {{$$ = $1;}}
    | ','                         {{$$ = [];}}
    |                             {{$$ = [];}}
    ;

list_import_1_comma // : [import]
    : list_import_1_comma ',' import_a   {{$1.push($3); $$ = $1;}}
    | import_a                           {{$$ = [$1];}}
    ;

import_a // : object
    : var                              {{$$ = {name: "import-var", varname: $1, pos: @$};}}
    | tycon                            {{$$ = {name: "import-tycon", tycon: $1, all: false, pos: @$};}}
    | tycon '(' ".." ')'               {{$$ = {name: "import-tycon", tycon: $1, all: true, pos: @$};}}
    | tycon '(' list_cname_0_comma ')' {{$$ = {name: "import-tycon", tycon: $1, all: false, list:$3, pos: @$};}}
    ; //TODO: classes

////////////////////////////////////////////////////////////////////////////////
// 3 Expressions

exp // : object
  : infixexp "::" type          {{$$ = {name:"type-signature",exp:$1,sig:$3,pos:@$};}}
  | infixexp %prec NOSIGNATURE  {{$$ = $1;}}
  ;

infixexp // : [lexp | qop | '-']
  : infixexpLR lexp     %prec INFIXEXP          {{
          ($1).push($2);
          if( ($1).length == 1 && ($1)[0].name=="infixexp" ){
                  $$ = ($1)[0];
          } else {
              $$ = {name:"infixexp",exps:$1,pos:@$};
          }
      }}
  ;

infixexpLR // : [lexp | qop | '-']. re-written to be left recursive.
  : infixexpLR lexp qop           {{($1).push($2,$3); $$ = $1;}}
  | infixexpLR '-'                {{($1).push($2);    $$ = $2;}}
  |                               {{$$ = [];}}
  ;
//  lexp OP infixexp            {{ ($3).unshift($1,$2); $$ = $3; }}
//  '-' infixexp                {{ ($2).shift($1);      $$ = $2; }}
//  lexp                        {{ $$ = [$1]; }}

lexp // : object
  : "if" exp "then" exp "else" exp  {{$$ = {name:"ite",e1:$2,e2:$4,e3:$6,pos:@$}; }}
  | fexp                            {{ $$ = ($1.length === 1) ? ($1[0]) : {name:"application", exps:$1,pos:@$}; }}
  | '\' apats "->" exp              {{$$ = {name:"lambda", args: $2, rhs: $4, pos: @$}; }}
  | "case" exp "of" "{" alts "}"    {{$$ = {name:"case", exp: $2, alts: $5, pos: @$}; }}
  | "let" decls "in" exp            {{$$ = {name:"let", decls: $2, exp: $4, pos: @$}; }}
  ;

// list of 1 or more 'aexp' without separator
fexp // : [aexp]
  : aexp              {{$$ = [$1];}}
  | fexp aexp         {{($1).push($2); $$ = $1;}}
  ;

// list of 1 or more non-qualified variable names
vars // : [var]
    : vars ',' var                {{$1.push($3); $$ = $1;}}
    | var                         {{$$ = [$1];}}
    ;

////////////////////////////////////////////////////////////////////////////////
// case expression alternatives

// ';' separated list of 1 or more 'alt'
alts // : [alt]
    : alts ";" alt      {{$1.push($3); $$ = $1;}}
    | alt               {{$$ = [$1];}}
    ;

alt // : object
    : pat "->" exp      {{$$ = {name:"alt", pat: $1, exp: $3};}}
    // TODO: incomplete
    ;

////////////////////////////////////////////////////////////////////////////////
// 3.2 Variables, Constructors, Operators, and Literals

list_cname_0_comma // : [cname]
    : list_cname_1_comma     {{$$ = $1;}}
    |                        {{$$ = [];}}
    ;
list_cname_1_comma // : [cname]
    : list_cname_1_comma ',' cname   {{$1.push($3); $$ = $1;}}
    | cname                          {{$$ = [$1];}}
    ;

// non-qualified variable name (record selector) or data constructor name
cname // : VarName | DaCon
    :  con        {{$$ = $1;}}
    // | var      {{$$ = $1;}}      // record selectors
    ;

aexp // : object
  : qvar                {{$$ = $1;}}
  | gcon                {{$$ = $1;}}
  | literal             {{$$ = $1;}}
  | "(" exp ")"         {{$$ = $2;}}
  | tuple               {{$$ = $1;}}
  | listexp             {{$$ = $1;}}
  // TODO: incomplete
  ;

tuple // : object
    : "(" exp "," list_exp_1_comma ")" {{$4.unshift($2); $$ = {name: "tuple", members: $4, pos: @$}; }}
    ;

listexp // : object
    : "[" list_exp_1_comma "]" {{ $$ = {name: "listexp", members: $2, pos: @$}; }}
    ;

list_exp_1_comma
    : list_exp_1_comma ',' exp   {{$1.push($3); $$ = $1; }}
    | exp                        {{$$ = [$1];}}
    ;

modid // : object # {conid .} conid
    : qconid              {{$$ = new JSHC.ModName($1, @$, yy.lexer.previous.qual);}}
    | conid               {{$$ = new JSHC.ModName($1, @$);}}
    ;

// optionally qualified binary operators in infix expressions
qop // : object
    : qvarop              {{$$ = {name: "qop", id: $1, pos: @$};}}
    | qconop              {{$$ = {name: "qop", id: $1, pos: @$};}}
    ;

op_list_1_comma // : [op]
    : op_list_1_comma "," op {{ $1.push($3); $$ = $1; }}
    | op                     {{ $$ = [$1]; }}
    ;

op // : object
    : varop {{ $$ = $1; }}
    | conop {{ $$ = $1; }}
    ;

conop // : object
    : consym                {{ $$ = new JSHC.DaCon($1, @$, true); }}
    | '`' conid '`'         {{ $$ = new JSHC.DaCon($2, @$, false); }}
    ;

// optionally qualified variable symbol or variable id as a symbol
qvarop // : object
    : qvarsym           {{$$ = new JSHC.VarName($1, @$, true, yy.lexer.previous.qual);}}
    | varop             {{$$ = $1;}}
    | '`' qvarid '`'    {{$$ = new JSHC.VarName($2, @$, false, yy.lexer.previous.qual);}}
    ;

qconop // : object
    : gconsym           {{$$ = $1;}}
    | '`' qconid '`'    {{$$ = new JSHC.DaCon($2, @$, false, yy.lexer.previous.qual);}}
    ;

// non-qualified variable symbol or variable id as a symbol
varop // : object
    : varsym            {{$$ = new JSHC.VarName($1, @$, true);}}
    | '`' varid '`'     {{$$ = new JSHC.VarName($2, @$, false)}}
    ;

// list of 0 or more tyvars without separator
tyvars // : [TyVar]
    : tyvars tyvar          {{$1.push($2); $$ = $1;}}
    | tyvar                 {{$$ = [$1];}}
    ;

// type variable
tyvar // : JSHC.TyVar
    : varid      {{$$ = new JSHC.TyVar($1, @$);}}
    ;

// non-qualified type constructor id name
tycon // : JSHC.TyCon
    : conid      {{$$ = new JSHC.TyCon($1, @$);}}
    ;

// optionally qualified type constructor id name
qtycon // : JSHC.TyCon
    : qconid     {{$$ = new JSHC.TyCon($1, @$, yy.lexer.previous.qual);}}
    | tycon      {{$$ = $1;}}
    ;

// non-qualified data constructor id (or symbol in parentheses) name
con // : JSHC.DaCon
    : conid              {{$$ = new JSHC.DaCon($1, @$, false);}}
    | '(' consym ')'     {{$$ = new JSHC.DaCon($2, @$, true);}}
    ;

// optionally qualified data constructor id (or symbol in parentheses) name
qcon // : JSHC.DaCon
    : qconid           {{$$ = new JSHC.DaCon($1, @$, false, yy.lexer.previous.qual);}}
    | '(' gconsym ')'  {{$$ = $2;}}
    | con              {{$$ = $1;}}
    ;

// optionally qualified data constructor, or a built-in data constructor
gcon // : object
    : "(" ")"               {{$$ = new JSHC.UnitDaCon(@$);}}
    | "[" "]"               {{$$ = new JSHC.NilDaCon(@$);}}
    | "(" list_1_comma ")"  {{$$ = new JSHC.TupleDaCon($2 + 1, @$);}}
    | qcon                  {{$$ = $1;}}
    ;

list_1_comma // : integer
    : ","                {{$$ = 1;}}
    | list_1_comma ","   {{$$ = $1 + 1;}}
    ;

// non-qualified variable id (or symbol in parentheses) name
var // : JSHC.VarName
    : varid           {{$$ = new JSHC.VarName($1, @$, false);}}
    | '(' varsym ')'  {{$$ = new JSHC.VarName($2, @$, true);}}
    ;

// optionally qualified variable id (or symbol in parentheses) name
qvar // : JSHC.VarName
    : qvarid          {{$$ = new JSHC.VarName($1, @$, false, yy.lexer.previous.qual);}}
    | '(' qvarsym ')' {{$$ = new JSHC.VarName($2, @$, true, yy.lexer.previous.qual);}}
    | var             {{$$ = $1;}}
    ;

gconsym // : object
    : ':'           {{$$ = new JSHC.ConsDaCon(@$);}}
    | qconsym       {{$$ = new JSHC.DaCon($1, @$, true, yy.lexer.previous.qual);}}
    ;

////////////////////////////////////////////////////////////////////////////////
// 4.1.2 Syntax of Types

atype // : object
    : gtycon                {{$$ = $1;}}
    | tyvar                 {{$$ = $1;}}
    | "(" type ")"          {{$$ = $2;}}
    // TODO: incomplete
    ;

type // : object
    : apptype               {{$$ = $1;}}
    | apptype "->" type     {{$$ = new JSHC.FunType([$1,$3],@$);}}
    ;

apptype // : object
    : apptype atype     {{$$ = new JSHC.AppType($1,$2,@$);}}
                        //{{$1.push($2); $$ = $1;}}
    | atype             {{$$ = $1;}}
                        //{{$$ = [$1];}}
    ;

// optionally qualified type constructor, or a built-in type constructor
gtycon // : object
    : qtycon            {{$$ = $1;}}
    // TODO: incomplete
    ;

////////////////////////////////////////////////////////////////////////////////
// 3.17 Pattern Matching

pat // : object
    : lpat             {{$$ = $1;}}
    // TODO: incomplete
    ;

lpat // : object
    : apat          {{$$ = $1;}}
    | gcon apats    {{$$ = {name: "conpat", con: $1, pats: $2}; }}
    // TODO: incomplete
    ;

// list of 1 or more apat without separator
apats // : [apat]
    : apat              {{$$ = [$1];}}
    | apats apat        {{$1.push($2); $$ = $1;}}
    ;

apat // : object
    : var               {{$$ = $1; }}
    | gcon              {{$$ = $1; }}
    | literal           {{$$ = $1; }}
    | '_'               {{$$ = {name:"wildcard", pos: @$}; }}
    | tuple_pat         {{$$ = $1; }}
    | "(" pat ")"       {{$$ = $2; }}
    ;

tuple_pat // object
    :  "(" pat "," pat_list_1_comma ")" {{$4.unshift($2); $$ = {name: "tuple_pat", members: $4, pos: @$}; }}
    ;
    
pat_list_1_comma // : [pat]
    : pat_list_1_comma "," pat      {{$1.push($3); $$ = $1; }}
    | pat                           {{$$ = [$1]; }}
    ;

////////////////////////////////////////////////////////////////////////////////
// ???

literal  // : object
    : integer {{$$ = {name: "integer-lit", value: Number($1), pos: @$};}}
    // TODO: incomplete
    ;

////////////////////////////////////////////////////////////////////////////////
