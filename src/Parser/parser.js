/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"start_":3,"module_":4,"EOF":5,"module":6,"modid":7,"where":8,"body":9,"(":10,"exports":11,")":12,"{":13,"topdecls":14,"}":15,"topdecls_nonempty":16,";":17,"topdecl":18,"decl":19,"data":20,"simpletype":21,"=":22,"constrs":23,"impdecl":24,"funlhs":25,"rhs":26,"var":27,"apats":28,"exp":29,"tycon":30,"tyvars":31,"|":32,"constr":33,"con":34,"constr_atypes":35,"atype":36,"exports_inner":37,",":38,"export":39,"qvar":40,"qtycon":41,"..":42,"list_cname_0_comma":43,"import":44,"imports":45,"hiding":46,"list_import_1_comma":47,"import_a":48,"infixexp":49,"::":50,"int":51,"infixexpLR":52,"lexp":53,"qop":54,"-":55,"if":56,"then":57,"else":58,"fexp":59,"\\":60,"->":61,"case":62,"of":63,"alts":64,"aexp":65,"alt":66,"pat":67,"list_cname_1_comma":68,"cname":69,"gcon":70,"literal":71,"qconid":72,"conid":73,"qvarop":74,"qconop":75,"qvarsym":76,"varop":77,"`":78,"qvarid":79,"varsym":80,"varid":81,"tyvar":82,"consym":83,"qcon":84,"gconsym":85,":":86,"qconsym":87,"gtycon":88,"lpat":89,"apat":90,"integer":91,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"module",8:"where",10:"(",12:")",13:"{",15:"}",17:";",20:"data",22:"=",32:"|",38:",",42:"..",44:"import",46:"hiding",50:"::",51:"int",55:"-",56:"if",57:"then",58:"else",60:"\\",61:"->",62:"case",63:"of",72:"qconid",73:"conid",75:"qconop",76:"qvarsym",78:"`",79:"qvarid",80:"varsym",81:"varid",83:"consym",86:":",87:"qconsym",91:"integer"},
productions_: [0,[3,2],[4,4],[4,7],[4,1],[9,3],[14,1],[16,3],[16,1],[18,1],[18,2],[18,4],[18,1],[19,2],[25,2],[25,1],[26,2],[21,1],[21,2],[23,3],[23,1],[33,1],[33,2],[35,2],[35,1],[11,1],[11,2],[37,3],[37,1],[39,1],[39,2],[39,1],[39,4],[39,4],[24,2],[24,5],[24,6],[45,1],[45,2],[45,1],[45,0],[47,3],[47,1],[48,1],[48,1],[48,4],[48,4],[29,3],[29,1],[49,2],[52,3],[52,2],[52,0],[53,6],[53,1],[53,4],[53,6],[59,1],[59,2],[64,3],[64,1],[66,3],[43,1],[43,0],[68,3],[68,1],[69,1],[65,1],[65,1],[65,1],[65,3],[7,1],[7,1],[54,1],[54,1],[74,1],[74,1],[74,3],[77,1],[77,3],[31,2],[31,1],[82,1],[30,1],[41,1],[41,1],[34,1],[34,3],[84,1],[84,1],[84,1],[70,1],[27,1],[27,3],[40,1],[40,3],[40,1],[85,1],[85,1],[36,1],[36,1],[88,1],[67,1],[89,1],[89,2],[28,1],[28,2],[90,1],[90,1],[71,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2:this.$ = {name: "module", modid: $$[$0-2], body: $$[$0], pos: this._$}; 
break;
case 3:this.$ = {name: "module", modid: $$[$0-5], exports: $$[$0-3], body: $$[$0-1], pos: this._$}; 
break;
case 4:this.$ = {name: "module", modid: new JSHC.ModName("Main"), body: $$[$0], pos:this._$}; 
break;
case 5: 
        var imps = [], decs = [], atdecs = false;
        for (var i = 0; i < $$[$0-1].length; i++) {
            if ($$[$0-1][i].name == "impdecl" && !atdecs) {
                imps.push($$[$0-1][i]);
            } else if ($$[$0-1][i].name == "impdecl" && atdecs) {
                throw new Error("Parse error: import declaration in statement block at line " + $$[$0-1][i].pos.first_line);
            } else {
                atdecs = true;
                decs.push($$[$0-1][i]);
            }
        }
        
        this.$ = {name: "body", impdecls: imps, topdecls: decs, pos:this._$}; 
break;
case 6: this.$ = $$[$0]; 
break;
case 7: $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 8: this.$ = [$$[$0]]; 
break;
case 9:this.$ = {name: "topdecl-decl", decl: $$[$0], pos: this._$};
break;
case 10:this.$ = {name: "topdecl-data", typ: $$[$0], constrs: [], pos: this._$};
break;
case 11:this.$ = {name: "topdecl-data", typ: $$[$0-2], constrs: $$[$0], pos: this._$};
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = {name: "decl-fun", lhs: $$[$0-1], rhs: $$[$0], pos:this._$};
break;
case 14:this.$ = {name: "fun-lhs", ident: $$[$0-1], args: $$[$0], pos: this._$};
break;
case 15:this.$ = {name:"fun-lhs", ident: $$[$0], args: [], pos: this._$};
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = {name: "simpletype", tycon: $$[$0], vars: [], pos: this._$};
break;
case 18:this.$ = {name: "simpletype", tycon: $$[$0-1], vars: $$[$0], pos: this._$};
break;
case 19:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 20:this.$ = [$$[$0]];
break;
case 21:this.$ = {name: "constr", dacon: $$[$0], types: [], pos: this._$};
break;
case 22:this.$ = {name: "constr", dacon: $$[$0-1], types: $$[$0], pos: this._$};
break;
case 23:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 24:this.$ = [$$[$0]];
break;
case 25:this.$ = $$[$0];
break;
case 26:this.$ = $$[$0-1];
break;
case 27:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 28:this.$ = [$$[$0]];
break;
case 29:this.$ = {name: "export-qvar", exp: $$[$0], pos: this._$};
break;
case 30:this.$ = {name: "export-module", exp: $$[$0], pos: this._$};
break;
case 31:this.$ = {name: "export-type-unspec", exp: $$[$0], pos: this._$};
break;
case 32:this.$ = {name: "export-type-all", exp: $$[$0-3], pos: this._$};
break;
case 33:this.$ = {name: "export-type-vars", exp: $$[$0-3], vars: $$[$0-1], pos: this._$};
break;
case 34:this.$ = {name: "impdecl", modid: $$[$0], pos: this._$};
break;
case 35:this.$ = {name: "impdecl", modid: $$[$0-3], hiding: false, imports: $$[$0-1], pos: this._$};
break;
case 36:this.$ = {name: "impdecl", modid: $$[$0-4], hiding: true, imports: $$[$0-1], pos: this._$};
break;
case 37:this.$ = $$[$0];
break;
case 38:this.$ = $$[$0-1];
break;
case 39:this.$ = [];
break;
case 40:this.$ = [];
break;
case 41:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 42:this.$ = [$$[$0]];
break;
case 43:this.$ = {name: "import-var", varname: $$[$0], pos: this._$};
break;
case 44:this.$ = {name: "import-tycon", tycon: $$[$0], all: false, pos: this._$};
break;
case 45:this.$ = {name: "import-tycon", tycon: $$[$0-3], all: true, pos: this._$};
break;
case 46:this.$ = {name: "import-tycon", tycon: $$[$0-3], all: false, list:$$[$0-1], pos: this._$};
break;
case 47:this.$ = {name:"constrained-exp",exp:$$[$0-2],sig:"int",pos:this._$};
break;
case 48:this.$ = $$[$0];
break;
case 49:($$[$0-1]).push($$[$0]); this.$ = {name:"infixexp",exps:$$[$0-1],pos:this._$};
break;
case 50:($$[$0-2]).push($$[$0-1],$$[$0]); this.$ = $$[$0-2];
break;
case 51:($$[$0-1]).push($$[$0]);    this.$ = $$[$0];
break;
case 52:this.$ = [];
break;
case 53:this.$ = {name:"ite",e1:$$[$0-4],e2:$$[$0-2],e3:$$[$0],pos:this._$};
break;
case 54:this.$ = {name:"application", exps:$$[$0],pos:this._$};
break;
case 55:this.$ = {name:"lambda", args: $$[$0-2], rhs: $$[$0], pos: this._$};
break;
case 56:this.$ = {name:"case", exp: $$[$0-4], alts: $$[$0-1]};
break;
case 57:this.$ = [$$[$0]];
break;
case 58:($$[$0-1]).push($$[$0]); this.$ = $$[$0-1];
break;
case 59:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 60:this.$ = [$$[$0]];
break;
case 61:this.$ = {name:"alt", pat: $$[$0-2], exp: $$[$0]};
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = [];
break;
case 64:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 65:this.$ = [$$[$0]];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = $$[$0];
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = $$[$0];
break;
case 70:this.$ = $$[$0-2];
break;
case 71:this.$ = new JSHC.ModName($$[$0], this._$, yy.lexer.recent.qual);
break;
case 72:this.$ = new JSHC.ModName($$[$0], this._$);
break;
case 73:this.$ = {name: "qop", id: $$[$0], pos: this._$};
break;
case 74:this.$ = {name: "qop", id: $$[$0], pos: this._$};
break;
case 75:this.$ = {name: "qvarop", id: $$[$0], pos: this._$};
break;
case 76:this.$ = $$[$0];
break;
case 77:this.$ = {name: "qvarop-var", id: $$[$0-1], pos: this._$};
break;
case 78:this.$ = {name: "varop", id: $$[$0], pos: this._$};
break;
case 79:this.$ = {name: "varop-var", id: $$[$0-1], pos: this._$};
break;
case 80:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 81:this.$ = [$$[$0]];
break;
case 82:this.$ = new JSHC.TyVar($$[$0], this._$);
break;
case 83:this.$ = new JSHC.TyCon($$[$0], this._$);
break;
case 84:this.$ = new JSHC.TyCon($$[$0], this._$, yy.lexer.recent.qual);
break;
case 85:this.$ = $$[$0];
break;
case 86:this.$ = new JSHC.DaCon($$[$0], this._$, false);
break;
case 87:this.$ = new JSHC.DaCon($$[$0-1], this._$, true);
break;
case 88:this.$ = new JSHC.DaCon($$[$0], this._$, false, yy.lexer.recent.qual);
break;
case 89:this.$ = new JSHC.DaCon($$[$01], this._$, true, yy.lexer.recent.qual);
break;
case 90:this.$ = $$[$0];
break;
case 92:this.$ = new JSHC.VarName($$[$0], this._$, false);
break;
case 93:this.$ = new JSHC.VarName($$[$0-1], this._$, true);
break;
case 94:this.$ = new JSHC.VarName($$[$0], this._$, false, yy.lexer.recent.qual);
break;
case 95:this.$ = new JSHC.VarName($$[$0-1], this._$, true, yy.lexer.recent.qual);
break;
case 96:this.$ = $$[$0];
break;
case 97:this.$ = new JSHC.DaCon($$[$0], this._$, true, yy.lexer.recent.qual);
break;
case 98:this.$ = new JSHC.DaCon($$[$0], this._$, true, yy.lexer.recent.qual);
break;
case 99:this.$ = $$[$0];
break;
case 100:this.$ = $$[$0];
break;
case 101:this.$ = $$[$0];
break;
case 102:this.$ = $$[$0];
break;
case 103:this.$ = $$[$0];
break;
case 104:this.$ = {name: "conpat", con: $$[$0-1], pats: $$[$0]}; 
break;
case 105:this.$ = [$$[$0]];
break;
case 106:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 107:this.$ = $$[$0]; 
break;
case 108:this.$ = $$[$0]; 
break;
case 109:this.$ = {name: "integer-lit", value: Number($$[$0]), pos: this._$};
break;
}
},
table: [{3:1,4:2,6:[1,3],9:4,13:[1,5]},{1:[3]},{5:[1,6]},{7:7,72:[1,8],73:[1,9]},{5:[2,4]},{10:[1,20],14:10,16:11,18:12,19:13,20:[1,14],24:15,25:16,27:18,44:[1,17],81:[1,19]},{1:[2,1]},{8:[1,21],10:[1,22]},{8:[2,71],10:[2,71],12:[2,71],15:[2,71],17:[2,71],38:[2,71],46:[2,71]},{8:[2,72],10:[2,72],12:[2,72],15:[2,72],17:[2,72],38:[2,72],46:[2,72]},{15:[1,23]},{15:[2,6],17:[1,24]},{15:[2,8],17:[2,8]},{15:[2,9],17:[2,9]},{21:25,30:26,73:[1,27]},{15:[2,12],17:[2,12]},{22:[1,29],26:28},{7:30,72:[1,8],73:[1,9]},{10:[1,35],22:[2,15],27:33,28:31,34:39,70:34,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],90:32},{10:[2,92],12:[2,92],15:[2,92],17:[2,92],22:[2,92],38:[2,92],50:[2,92],57:[2,92],58:[2,92],61:[2,92],63:[2,92],72:[2,92],73:[2,92],75:[2,92],76:[2,92],78:[2,92],79:[2,92],80:[2,92],81:[2,92],86:[2,92],87:[2,92],91:[2,92]},{80:[1,43]},{9:44,13:[1,5]},{6:[1,49],10:[1,52],11:45,27:53,30:55,37:46,39:47,40:48,41:50,72:[1,54],73:[1,27],79:[1,51],81:[1,19]},{5:[2,5]},{10:[1,20],18:56,19:13,20:[1,14],24:15,25:16,27:18,44:[1,17],81:[1,19]},{15:[2,10],17:[2,10],22:[1,57]},{15:[2,17],17:[2,17],22:[2,17],31:58,81:[1,60],82:59},{10:[2,83],12:[2,83],15:[2,83],17:[2,83],22:[2,83],32:[2,83],38:[2,83],72:[2,83],73:[2,83],81:[2,83]},{15:[2,13],17:[2,13]},{10:[2,52],29:61,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{10:[1,64],15:[2,34],17:[2,34],46:[1,65]},{10:[1,35],22:[2,14],27:33,34:39,70:34,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],90:66},{10:[2,105],22:[2,105],61:[2,105],72:[2,105],73:[2,105],81:[2,105],86:[2,105],87:[2,105]},{10:[2,107],22:[2,107],61:[2,107],72:[2,107],73:[2,107],81:[2,107],86:[2,107],87:[2,107]},{10:[2,108],22:[2,108],61:[2,108],72:[2,108],73:[2,108],81:[2,108],86:[2,108],87:[2,108]},{80:[1,43],83:[1,67]},{10:[2,91],12:[2,91],15:[2,91],17:[2,91],22:[2,91],50:[2,91],57:[2,91],58:[2,91],61:[2,91],63:[2,91],72:[2,91],73:[2,91],75:[2,91],76:[2,91],78:[2,91],79:[2,91],80:[2,91],81:[2,91],86:[2,91],87:[2,91],91:[2,91]},{10:[2,88],12:[2,88],15:[2,88],17:[2,88],22:[2,88],50:[2,88],57:[2,88],58:[2,88],61:[2,88],63:[2,88],72:[2,88],73:[2,88],75:[2,88],76:[2,88],78:[2,88],79:[2,88],80:[2,88],81:[2,88],86:[2,88],87:[2,88],91:[2,88]},{10:[2,89],12:[2,89],15:[2,89],17:[2,89],22:[2,89],50:[2,89],57:[2,89],58:[2,89],61:[2,89],63:[2,89],72:[2,89],73:[2,89],75:[2,89],76:[2,89],78:[2,89],79:[2,89],80:[2,89],81:[2,89],86:[2,89],87:[2,89],91:[2,89]},{10:[2,90],12:[2,90],15:[2,90],17:[2,90],22:[2,90],50:[2,90],57:[2,90],58:[2,90],61:[2,90],63:[2,90],72:[2,90],73:[2,90],75:[2,90],76:[2,90],78:[2,90],79:[2,90],80:[2,90],81:[2,90],86:[2,90],87:[2,90],91:[2,90]},{10:[2,97],12:[2,97],15:[2,97],17:[2,97],22:[2,97],50:[2,97],57:[2,97],58:[2,97],61:[2,97],63:[2,97],72:[2,97],73:[2,97],75:[2,97],76:[2,97],78:[2,97],79:[2,97],80:[2,97],81:[2,97],86:[2,97],87:[2,97],91:[2,97]},{10:[2,98],12:[2,98],15:[2,98],17:[2,98],22:[2,98],50:[2,98],57:[2,98],58:[2,98],61:[2,98],63:[2,98],72:[2,98],73:[2,98],75:[2,98],76:[2,98],78:[2,98],79:[2,98],80:[2,98],81:[2,98],86:[2,98],87:[2,98],91:[2,98]},{10:[2,86],12:[2,86],15:[2,86],17:[2,86],22:[2,86],32:[2,86],38:[2,86],50:[2,86],57:[2,86],58:[2,86],61:[2,86],63:[2,86],72:[2,86],73:[2,86],75:[2,86],76:[2,86],78:[2,86],79:[2,86],80:[2,86],81:[2,86],86:[2,86],87:[2,86],91:[2,86]},{12:[1,68]},{5:[2,2]},{12:[1,69]},{12:[2,25],38:[1,70]},{12:[2,28],38:[2,28]},{12:[2,29],38:[2,29]},{7:71,72:[1,8],73:[1,9]},{10:[1,72],12:[2,31],38:[2,31]},{10:[2,94],12:[2,94],15:[2,94],17:[2,94],38:[2,94],50:[2,94],57:[2,94],58:[2,94],63:[2,94],72:[2,94],73:[2,94],75:[2,94],76:[2,94],78:[2,94],79:[2,94],80:[2,94],81:[2,94],86:[2,94],87:[2,94],91:[2,94]},{76:[1,73],80:[1,43]},{10:[2,96],12:[2,96],15:[2,96],17:[2,96],38:[2,96],50:[2,96],57:[2,96],58:[2,96],63:[2,96],72:[2,96],73:[2,96],75:[2,96],76:[2,96],78:[2,96],79:[2,96],80:[2,96],81:[2,96],86:[2,96],87:[2,96],91:[2,96]},{10:[2,84],12:[2,84],15:[2,84],17:[2,84],32:[2,84],38:[2,84],72:[2,84],73:[2,84],81:[2,84]},{10:[2,85],12:[2,85],15:[2,85],17:[2,85],32:[2,85],38:[2,85],72:[2,85],73:[2,85],81:[2,85]},{15:[2,7],17:[2,7]},{10:[1,77],23:74,33:75,34:76,73:[1,42]},{15:[2,18],17:[2,18],22:[2,18],81:[1,60],82:78},{15:[2,81],17:[2,81],22:[2,81],81:[2,81]},{15:[2,82],17:[2,82],22:[2,82],32:[2,82],72:[2,82],73:[2,82],81:[2,82]},{15:[2,16],17:[2,16]},{12:[2,48],15:[2,48],17:[2,48],50:[1,79],57:[2,48],58:[2,48],63:[2,48],75:[2,48],76:[2,48],78:[2,48],80:[2,48]},{10:[1,90],27:53,34:39,40:87,53:80,55:[1,81],56:[1,82],59:83,60:[1,84],62:[1,85],65:86,70:88,71:89,72:[1,37],73:[1,42],79:[1,51],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],91:[1,91]},{10:[1,20],12:[2,40],27:96,30:97,38:[1,94],45:92,47:93,48:95,73:[1,27],81:[1,19]},{10:[1,98]},{10:[2,106],22:[2,106],61:[2,106],72:[2,106],73:[2,106],81:[2,106],86:[2,106],87:[2,106]},{12:[1,99]},{10:[2,93],12:[2,93],15:[2,93],17:[2,93],22:[2,93],38:[2,93],50:[2,93],57:[2,93],58:[2,93],61:[2,93],63:[2,93],72:[2,93],73:[2,93],75:[2,93],76:[2,93],78:[2,93],79:[2,93],80:[2,93],81:[2,93],86:[2,93],87:[2,93],91:[2,93]},{8:[1,100]},{6:[1,49],10:[1,52],12:[2,26],27:53,30:55,39:101,40:48,41:50,72:[1,54],73:[1,27],79:[1,51],81:[1,19]},{12:[2,30],38:[2,30]},{10:[1,77],12:[2,63],34:106,42:[1,102],43:103,68:104,69:105,73:[1,42]},{12:[1,107]},{15:[2,11],17:[2,11],32:[1,108]},{15:[2,20],17:[2,20],32:[2,20]},{15:[2,21],17:[2,21],30:55,32:[2,21],35:109,36:110,41:113,72:[1,54],73:[1,27],81:[1,60],82:112,88:111},{83:[1,67]},{15:[2,80],17:[2,80],22:[2,80],81:[2,80]},{51:[1,114]},{12:[2,49],15:[2,49],17:[2,49],50:[2,49],54:115,57:[2,49],58:[2,49],63:[2,49],74:116,75:[1,117],76:[1,118],77:119,78:[1,120],80:[1,121]},{10:[2,51],55:[2,51],56:[2,51],60:[2,51],62:[2,51],72:[2,51],73:[2,51],79:[2,51],81:[2,51],86:[2,51],87:[2,51],91:[2,51]},{10:[2,52],29:122,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{10:[1,90],12:[2,54],15:[2,54],17:[2,54],27:53,34:39,40:87,50:[2,54],57:[2,54],58:[2,54],63:[2,54],65:123,70:88,71:89,72:[1,37],73:[1,42],75:[2,54],76:[2,54],78:[2,54],79:[1,51],80:[2,54],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],91:[1,91]},{10:[1,35],27:33,28:124,34:39,70:34,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],90:32},{10:[2,52],29:125,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{10:[2,57],12:[2,57],15:[2,57],17:[2,57],50:[2,57],57:[2,57],58:[2,57],63:[2,57],72:[2,57],73:[2,57],75:[2,57],76:[2,57],78:[2,57],79:[2,57],80:[2,57],81:[2,57],86:[2,57],87:[2,57],91:[2,57]},{10:[2,67],12:[2,67],15:[2,67],17:[2,67],50:[2,67],57:[2,67],58:[2,67],63:[2,67],72:[2,67],73:[2,67],75:[2,67],76:[2,67],78:[2,67],79:[2,67],80:[2,67],81:[2,67],86:[2,67],87:[2,67],91:[2,67]},{10:[2,68],12:[2,68],15:[2,68],17:[2,68],50:[2,68],57:[2,68],58:[2,68],63:[2,68],72:[2,68],73:[2,68],75:[2,68],76:[2,68],78:[2,68],79:[2,68],80:[2,68],81:[2,68],86:[2,68],87:[2,68],91:[2,68]},{10:[2,69],12:[2,69],15:[2,69],17:[2,69],50:[2,69],57:[2,69],58:[2,69],63:[2,69],72:[2,69],73:[2,69],75:[2,69],76:[2,69],78:[2,69],79:[2,69],80:[2,69],81:[2,69],86:[2,69],87:[2,69],91:[2,69]},{10:[2,52],29:126,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],76:[1,73],79:[2,52],80:[1,43],81:[2,52],83:[1,67],86:[2,52],87:[2,52],91:[2,52]},{10:[2,109],12:[2,109],15:[2,109],17:[2,109],50:[2,109],57:[2,109],58:[2,109],63:[2,109],72:[2,109],73:[2,109],75:[2,109],76:[2,109],78:[2,109],79:[2,109],80:[2,109],81:[2,109],86:[2,109],87:[2,109],91:[2,109]},{12:[1,127]},{12:[2,37],38:[1,128]},{12:[2,39]},{12:[2,42],38:[2,42]},{12:[2,43],38:[2,43]},{10:[1,129],12:[2,44],38:[2,44]},{10:[1,20],12:[2,40],27:96,30:97,38:[1,94],45:130,47:93,48:95,73:[1,27],81:[1,19]},{10:[2,87],12:[2,87],15:[2,87],17:[2,87],22:[2,87],32:[2,87],38:[2,87],50:[2,87],57:[2,87],58:[2,87],61:[2,87],63:[2,87],72:[2,87],73:[2,87],75:[2,87],76:[2,87],78:[2,87],79:[2,87],80:[2,87],81:[2,87],86:[2,87],87:[2,87],91:[2,87]},{9:131,13:[1,5]},{12:[2,27],38:[2,27]},{12:[1,132]},{12:[1,133]},{12:[2,62],38:[1,134]},{12:[2,65],38:[2,65]},{12:[2,66],38:[2,66]},{10:[2,95],12:[2,95],15:[2,95],17:[2,95],38:[2,95],50:[2,95],57:[2,95],58:[2,95],63:[2,95],72:[2,95],73:[2,95],75:[2,95],76:[2,95],78:[2,95],79:[2,95],80:[2,95],81:[2,95],86:[2,95],87:[2,95],91:[2,95]},{10:[1,77],33:135,34:76,73:[1,42]},{15:[2,22],17:[2,22],30:55,32:[2,22],36:136,41:113,72:[1,54],73:[1,27],81:[1,60],82:112,88:111},{15:[2,24],17:[2,24],32:[2,24],72:[2,24],73:[2,24],81:[2,24]},{15:[2,99],17:[2,99],32:[2,99],72:[2,99],73:[2,99],81:[2,99]},{15:[2,100],17:[2,100],32:[2,100],72:[2,100],73:[2,100],81:[2,100]},{15:[2,101],17:[2,101],32:[2,101],72:[2,101],73:[2,101],81:[2,101]},{12:[2,47],15:[2,47],17:[2,47],50:[2,47],57:[2,47],58:[2,47],63:[2,47],75:[2,47],76:[2,47],78:[2,47],80:[2,47]},{10:[2,50],55:[2,50],56:[2,50],60:[2,50],62:[2,50],72:[2,50],73:[2,50],79:[2,50],81:[2,50],86:[2,50],87:[2,50],91:[2,50]},{10:[2,73],55:[2,73],56:[2,73],60:[2,73],62:[2,73],72:[2,73],73:[2,73],79:[2,73],81:[2,73],86:[2,73],87:[2,73],91:[2,73]},{10:[2,74],55:[2,74],56:[2,74],60:[2,74],62:[2,74],72:[2,74],73:[2,74],79:[2,74],81:[2,74],86:[2,74],87:[2,74],91:[2,74]},{10:[2,75],55:[2,75],56:[2,75],60:[2,75],62:[2,75],72:[2,75],73:[2,75],79:[2,75],81:[2,75],86:[2,75],87:[2,75],91:[2,75]},{10:[2,76],55:[2,76],56:[2,76],60:[2,76],62:[2,76],72:[2,76],73:[2,76],79:[2,76],81:[2,76],86:[2,76],87:[2,76],91:[2,76]},{79:[1,137],81:[1,138]},{10:[2,78],55:[2,78],56:[2,78],60:[2,78],62:[2,78],72:[2,78],73:[2,78],79:[2,78],81:[2,78],86:[2,78],87:[2,78],91:[2,78]},{57:[1,139]},{10:[2,58],12:[2,58],15:[2,58],17:[2,58],50:[2,58],57:[2,58],58:[2,58],63:[2,58],72:[2,58],73:[2,58],75:[2,58],76:[2,58],78:[2,58],79:[2,58],80:[2,58],81:[2,58],86:[2,58],87:[2,58],91:[2,58]},{10:[1,35],27:33,34:39,61:[1,140],70:34,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],90:66},{63:[1,141]},{12:[1,142]},{15:[2,35],17:[2,35]},{10:[1,20],12:[2,38],27:96,30:97,48:143,73:[1,27],81:[1,19]},{10:[1,77],12:[2,63],34:106,42:[1,144],43:145,68:104,69:105,73:[1,42]},{12:[1,146]},{5:[2,3]},{12:[2,32],38:[2,32]},{12:[2,33],38:[2,33]},{10:[1,77],34:106,69:147,73:[1,42]},{15:[2,19],17:[2,19],32:[2,19]},{15:[2,23],17:[2,23],32:[2,23],72:[2,23],73:[2,23],81:[2,23]},{78:[1,148]},{78:[1,149]},{10:[2,52],29:150,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{10:[2,52],29:151,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{13:[1,152]},{10:[2,70],12:[2,70],15:[2,70],17:[2,70],50:[2,70],57:[2,70],58:[2,70],63:[2,70],72:[2,70],73:[2,70],75:[2,70],76:[2,70],78:[2,70],79:[2,70],80:[2,70],81:[2,70],86:[2,70],87:[2,70],91:[2,70]},{12:[2,41],38:[2,41]},{12:[1,153]},{12:[1,154]},{15:[2,36],17:[2,36]},{12:[2,64],38:[2,64]},{10:[2,77],55:[2,77],56:[2,77],60:[2,77],62:[2,77],72:[2,77],73:[2,77],79:[2,77],81:[2,77],86:[2,77],87:[2,77],91:[2,77]},{10:[2,79],55:[2,79],56:[2,79],60:[2,79],62:[2,79],72:[2,79],73:[2,79],79:[2,79],81:[2,79],86:[2,79],87:[2,79],91:[2,79]},{58:[1,155]},{12:[2,55],15:[2,55],17:[2,55],50:[2,55],57:[2,55],58:[2,55],63:[2,55],75:[2,55],76:[2,55],78:[2,55],80:[2,55]},{10:[1,35],27:33,34:39,64:156,66:157,67:158,70:161,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],89:159,90:160},{12:[2,45],38:[2,45]},{12:[2,46],38:[2,46]},{10:[2,52],29:162,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{15:[1,163],17:[1,164]},{15:[2,60],17:[2,60]},{61:[1,165]},{61:[2,102]},{61:[2,103]},{10:[1,35],27:33,28:166,34:39,61:[2,108],70:34,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],90:32},{12:[2,53],15:[2,53],17:[2,53],50:[2,53],57:[2,53],58:[2,53],63:[2,53],75:[2,53],76:[2,53],78:[2,53],80:[2,53]},{12:[2,56],15:[2,56],17:[2,56],50:[2,56],57:[2,56],58:[2,56],63:[2,56],75:[2,56],76:[2,56],78:[2,56],80:[2,56]},{10:[1,35],27:33,34:39,66:167,67:158,70:161,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],89:159,90:160},{10:[2,52],29:168,49:62,52:63,55:[2,52],56:[2,52],60:[2,52],62:[2,52],72:[2,52],73:[2,52],79:[2,52],81:[2,52],86:[2,52],87:[2,52],91:[2,52]},{10:[1,35],27:33,34:39,61:[2,104],70:34,72:[1,37],73:[1,42],81:[1,19],84:36,85:38,86:[1,40],87:[1,41],90:66},{15:[2,59],17:[2,59]},{15:[2,61],17:[2,61]}],
defaultActions: {4:[2,4],6:[2,1],23:[2,5],44:[2,2],94:[2,39],131:[2,3],159:[2,102],160:[2,103]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    };

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+'\nExpecting '+expected.join(', ');
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }
            
            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column,
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}