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
%nonassoc  ITE NOSIG INFIXEXP
%nonassoc  OP "::"

%start module_
%error-verbose
%debug
%%

/* 4 Declarations and Bindings */

module_ // : object
  : "module" modid "where" body EOF
         {{return {name: "module", modid: $2, body: $4, pos: @$}; }}
//        //unspecified export means export everything.
  | "module" modid '(' exports ')' "where" body EOF
        {{return {name: "module", modid: $2, exports: $4, body: $6, pos: @$}; }}
  | body EOF
      {{ return {name: "module", body: $1, pos:@$}; }}
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
                throw new Error("Parse error: import declaration in statement block at line " + $2[i].pos.first_line);
            } else {
                atdecs = true;
                decs.push($2[i]);
            }
        }
        
        $$ = {name: "body", impdecls: imps, topdecls: decs, pos:@$}; }}
  ;
  
topdecls // : [topdecl]
  : topdecls_nonempty                 {{ $$ = $1; }}
  ;
  
topdecls_nonempty // : [topdecl]
  : topdecls_nonempty ";" topdecl     {{ $1.push($3); $$ = $1; }}
  | topdecl                           {{ $$ = [$1]; }}
  ;

topdecl // : object
    : decl                              
        {{ $$ = {name: "topdecl-decl", decl: $1, pos: @$}; }}
    | "data" simpletype
        {{$$ = {name: "topdecl-data", typ: $2, constrs: [], pos: @$}; }}
    | "data" simpletype "=" constrs
        {{$$ = {name: "topdecl-data", typ: $2, constrs: $3, pos: @$}; }}
    | impdecl
        {{ $$ = $1;}}
    ;

decls // : [decl]
  : '{' '}'                           {{ $$ = []; }}
  | '{' list_decl_comma_1 '}'         {{ $$ = $2; }}
  ;
  
list_decl_comma_1 // : [decl]
  : list_decl_comma_1 ";" decl        {{ ($1).push($3); $$ = $1; }}
  | decl                              {{ $$ = [$1]; }}
  ;

decl // : object
  : funlhs rhs              
    {{ $$ = {name: "decl-fun", lhs: $1, rhs: $2, pos:@$}; }}
    //| pat rhs
  // | gendecl
  ;

funlhs // : object
    : var apats             
        {{$$ = {name: "fun-lhs", ident: $1, args: $2, pos: @$};}}
    | var 
        {{$$ = {name:"fun-lhs", ident: $1, args: [], pos: @$};}}
//  | pat varop pat
    ;

rhs // : object
    : '=' exp               {{$$ = $2;}}
    ; //TODO

simpletype // : object
    : tycon 
        {{$$ = {name: "simpletype", con: $1, vars: [], pos: @$}; }}
    | tycon tyvars
        {{$$ = {name: "simpletype", con: $1, vars: $2, pos: @$}; }}
    ;

constrs // : [constr]
    : constrs "|" constr        {{$1.push($3); $$ = $1;}}
    | constr                    {{$$ = [$1];}}
    ;

constr // : object
    : con 
        {{$$ = {name: "constr", con: $1, types: [], pos: @$}; }}
    | con atypes
        {{$$ = {name: "constr", con: $1, types: [], pos: @$}; }}
     
    ;
/* 5 Modules */
  
exports // : [export]
    : exports_inner         {{ $$ = $1; }}
    | exports_inner ','     {{ $$ = $1; }}
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
    | qtycon '(' vars ')'
        {{$$ = {name: "export-type-vars", exp: $1, vars: $3, pos: @$};}}
    ; //TODO: export types and classes

    
impdecl // : object
    : "import" modid 
        {{$$ = {name: "impdecl", modid: $2, pos: @$}; }}
    | "import" modid impspec
        {{$$ = {name: "impdecl", modid: $2, impspec: $3, pos: @$}; }}
    ; //TODO: qualified and renamed imports

impspec // : object
    : '(' imports ')' 
        {{$$ = {name: "impspec", imports: $2, pos: @$};}}
    | "hiding" '(' imports ')' 
        {{$$ = {name: "impspec-hiding", imports: $2, pos: @$};}}
    ;

imports // : [import]
    : imports_inner         {{ $$ = $1; }}
    | imports_inner ','     {{ $$ = $1; }}
    ;

imports_inner // : [import]
    : imports_inner ',' import_a      {{$1.push($3); $$ = $1;}}
    | import_a                        {{$$ = [$1];}}
    ;

import_a // : object
    : var           {{$$ = $1;}}                          
    ; //TODO: constructors and classes

/* 3 Expressions */

exp // : object
  : infixexp "::" "int"               
    {{ $$ = {name:"typed-exp",infixexp:$1,pos:@$}; }}
  | infixexp %prec NOSIG              
    {{ $$ = {name:"untyped-exp",infixexp:$1,pos:@$}; }}
  ;

infixexp // : [lexp | qop | '-']
  : infixexpLR lexp %prec INFIXEXP {{ ($1).push($2); $$ = $1; }}
  ;

infixexpLR // : [lexp | qop | '-']. re-written to be left recursive.
  : infixexpLR lexp qop            {{ ($1).push($2,$3); $$ = $1; }}
  | infixexpLR '-'                {{ ($1).push($2);    $$ = $2; }}
  |                               {{ $$ = []; }}
  ;
//infixexp // list of lexp, OP, and '-'. should use left-recursion and ".push".
//  : lexp OP infixexp            {{ ($3).unshift($1,$2); $$ = $3; }}
//  | '-' infixexp                {{ ($2).shift($1);      $$ = $2; }}
//  | lexp                        {{ $$ = [$1]; }}
//  ;

lexp // : object
  : //"let" decls "in" exp                        {$$ = ["letrec",$2,$4];}
  //|
    "if" exp "then" exp "else" exp %prec ITE 
        {{ $$ = {name:"ite",e1:$2,e2:$4,e3:$6,pos:@$}; }}
  | fexp                                
    {{ $$ = {name:"fexp", exps:$1,pos:@$}; }}
  | '\' apats "->" exp 
    {{$$ = {name:"lambda", args: $2, rhs: $4, pos: @$}; }}
  | "case" exp "of" "{" alts "}"
    {{$$ = {name:"case", exp: $2, alts: $5}; }}
  ;

fexp //: [aexp]
  : aexp              {{ $$ = [$1]; }}
  | fexp aexp         {{ $1.push($2); $$ = $1; }}
  ;  

alts // : [alt]
    : alts ";" alt      {{$1.push($3); $$ = $1;}}
    | alt               {{$$ = [$1];}}
    ;
    
alt // : object
    : pat "->" exp
        {{$$ = {name:"alt", pat: $1, exp: $3}; }}
    ;
    
aexp // : object
  : qvar             {{$$ = $1; }}
  | literal            {{ $$ = $1; }}
  | "(" exp ")"         {{ $$ = $2; }}
  ;
  
/* 3.2 Variables, Constructors, Operators and Literals */

modid // : qcon
    : qcon
    ;

literal  // : object
    : integer {{$$ = {name: "integer-lit", value: Number($1), pos: @$}; }}
    ;

vars // : [var]
    : vars ',' var  {{$1.push($3); $$ = $1; }}
    | var           {{$$ = [$1];}}
    ;
    
var // : object
    : varid 
        {{$$ = {name: "var", id: $1, pos: @$};}}
    | '(' varsym ')' 
        {{$$ = {name: "var-op", id: $2, pos: @$};}}
    ;

qvar // : object
    : qvarid
        {{$$ = {name: "qvar", id: $1, pos: @$};}}
    | '(' qvarsym ')'
        {{$$ = {name: "qvar-op", id: $2, pos: @$};}}
    | var {{$$ = $1;}}
    ;

//tyvars // : [tyvar]
//    : tyvars_inner          {{$$ = $1;}}
//    |                       {{$$ = [];}}
//    ;
tyvars // : [tyvar]
    : tyvars tyvar          {{$1.push($2); $$ = $1;}}
    | tyvar                       {{$$ = [$1];}}
    ;
    
tyvar // : object
    : varid
        {{$$ = {name: "tyvar", id: $1, pos: @$}; }}
    ;

gcon // : object
    : qcon
    ;

qcon // : object
    : qconid
        {{$$ = {name: "qcon", id: $1, pos: @$}; }}
    | gconsym       {{$$ = {name: "qcon-op", id: $1, pos: @$}; }}
    | con           {{$$ = $1;}}
    ;

gconsym // : object
    : ':'           {{$$ = $1;}}
    | qconsym       {{$$ = $1;}}
    ;
    
con // : object
    : conid 
        {{$$ = {name: "con", id: $1, pos: @$};}}
    | '(' consym ')'
        {{$$ = {name: "con-op", id: $2, pos: @$};}}
    ;

tycon // : object
    : conid
        {{$$ = {name: "tycon", id: $1, pos: @$}; }}
    ;

qop // : object
    : qvarop            {{$$ = $1;}}
    | qconop            {{$$ = $1;}}
    ;

qvarop // : object
    : qvarsym
        {{$$ = {name: "qvarop", id: $1, pos: @$};}}
    | '`' qvarid '`'
        {{$$ = {name: "qvarop-var", id: $2, pos: @$};}}
    | varop {{$$ = $1;}}
    ;
    
varop // : object
    : varsym 
        {{$$ = {name: "varop", id: $1, pos: @$};}}
    | '`' varid '`'
        {{$$ = {name: "varop-var", id: $2, pos: @$};}}
    ;
atypes // : [atype]
    : atypes atype      {{$1.push($2); $$ = $1; }}
    | atype             {{$$ = [$1]; }}
    ;
     
atype // : object
    : gtycon
    | tyvar
    ;

gtycon // : object
    : qtycon
    ;

qtycon // : object
    : qconid
        {{$$ = {name: "qtycon", id: $1, pos: @$}; }}
    | tycon
    ; 
/* 3.17 Pattern matching */

pat // : 
    : lpat          {{$$ = $1;}}
    ;

lpat // : object
    : apat          {{$$ = $1;}}
    | gcon apats
        {{$$ = {name: "conpat", con: $1, pats: $2}; }}
    ;
    
apats // : [apat]
    : apat              {{$$ = [$1];}}
    | apats apat        {{$1.push($2); $$ = $1;}}
    ;
    
apat // : object
    : var               {{$$ = $1; }}
//    | literal           {{$$ = $1; }}
    | gcon              {{$$ = $1; }}
    ; //TODO: all other pattern matches
