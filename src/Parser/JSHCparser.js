/* Jison generated parser */
var JSHCparser = (function(){
var parser = {trace: 
function trace() {
}
,
yy: {},
symbols_: {"error":2,"start_":3,"module_":4,"EOF":5,"module":6,"modid":7,"where":8,"body":9,"(":10,"exports":11,")":12,"{":13,"topdecls":14,"}":15,"topdecls_nonempty":16,";":17,"topdecl":18,"decl":19,"data":20,"simpletype":21,"=":22,"constrs":23,"impdecl":24,"decls":25,"list_decl_comma_1":26,"funlhs":27,"rhs":28,"gendecl":29,"var":30,"apats":31,"exp":32,"infixl":33,"literal":34,"op_list_1_comma":35,"infixr":36,"infix":37,"tycon":38,"tyvars":39,"|":40,"constr":41,"con":42,"constr_atypes":43,"atype":44,"exports_inner":45,",":46,"export":47,"qvar":48,"qtycon":49,"..":50,"list_cname_0_comma":51,"import":52,"imports":53,"hiding":54,"list_import_1_comma":55,"import_a":56,"infixexp":57,"::":58,"int":59,"infixexpLR":60,"lexp":61,"qop":62,"-":63,"if":64,"then":65,"else":66,"fexp":67,"\\":68,"->":69,"case":70,"of":71,"alts":72,"let":73,"in":74,"aexp":75,"alt":76,"pat":77,"list_cname_1_comma":78,"cname":79,"gcon":80,"tuple":81,"list_exp_1_comma":82,"qconid":83,"conid":84,"qvarop":85,"qconop":86,"op":87,"varop":88,"conop":89,"consym":90,"`":91,"qvarsym":92,"qvarid":93,"varsym":94,"varid":95,"tyvar":96,"qcon":97,"gconsym":98,":":99,"qconsym":100,"gtycon":101,"lpat":102,"apat":103,"tuple_pat":104,"pat_list_1_comma":105,"integer":106,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"module",8:"where",10:"(",12:")",13:"{",15:"}",17:";",20:"data",22:"=",33:"infixl",36:"infixr",37:"infix",40:"|",46:",",50:"..",52:"import",54:"hiding",58:"::",59:"int",63:"-",64:"if",65:"then",66:"else",68:"\\",69:"->",70:"case",71:"of",73:"let",74:"in",83:"qconid",84:"conid",86:"qconop",90:"consym",91:"`",92:"qvarsym",93:"qvarid",94:"varsym",95:"varid",99:":",100:"qconsym",106:"integer"},
productions_: [0,[3,2],[4,4],[4,7],[4,1],[9,3],[14,1],[16,3],[16,1],[18,1],[18,2],[18,4],[18,1],[25,2],[25,3],[25,3],[25,4],[26,3],[26,1],[19,2],[19,1],[27,2],[27,1],[28,2],[29,3],[29,3],[29,3],[21,1],[21,2],[23,3],[23,1],[41,1],[41,2],[43,2],[43,1],[11,1],[11,2],[45,3],[45,1],[47,1],[47,2],[47,1],[47,4],[47,4],[24,2],[24,5],[24,6],[53,1],[53,2],[53,1],[53,0],[55,3],[55,1],[56,1],[56,1],[56,4],[56,4],[32,3],[32,1],[57,2],[60,3],[60,2],[60,0],[61,6],[61,1],[61,4],[61,6],[61,4],[67,1],[67,2],[72,3],[72,1],[76,3],[51,1],[51,0],[78,3],[78,1],[79,1],[75,1],[75,1],[75,1],[75,3],[75,1],[81,5],[82,3],[82,1],[7,1],[7,1],[62,1],[62,1],[35,3],[35,1],[87,1],[87,1],[89,1],[89,3],[85,1],[85,1],[85,3],[88,1],[88,3],[39,2],[39,1],[96,1],[38,1],[49,1],[49,1],[42,1],[42,3],[97,1],[97,1],[97,1],[80,1],[30,1],[30,3],[48,1],[48,3],[48,1],[98,1],[98,1],[44,1],[44,1],[101,1],[77,1],[102,1],[102,2],[31,1],[31,2],[103,1],[103,1],[103,1],[103,1],[104,5],[105,3],[105,1],[34,1]],
performAction: 
function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
    var $0 = $$.length - 1;
    switch (yystate) {
      case 1:
        return $$[$0 - 1];
        break;
      case 2:
        this.$ = {name:"module", modid:$$[$0 - 2], body:$$[$0], pos:this._$};
        break;
      case 3:
        this.$ = {name:"module", modid:$$[$0 - 5], exports:$$[$0 - 3], body:$$[$0 - 1], pos:this._$};
        break;
      case 4:
        this.$ = {name:"module", modid:new JSHC.ModName("Main"), body:$$[$0], pos:this._$};
        break;
      case 5:
        var imps = [], decs = [], atdecs = false;
        for (var i = 0; i < $$[$0 - 1].length; i++) {
            if ($$[$0 - 1][i].name == "impdecl" && !atdecs) {
                imps.push($$[$0 - 1][i]);
            } else {
                if ($$[$0 - 1][i].name == "impdecl" && atdecs) {
                    throw new Error("Parse error: import declaration in statement block at line " + $$[$0 - 1][i].pos.first_line);
                } else {
                    atdecs = true;
                    decs.push($$[$0 - 1][i]);
                }
            }
        }
        this.$ = {name:"body", impdecls:imps, topdecls:decs, pos:this._$};
        break;
      case 6:
        this.$ = $$[$0];
        break;
      case 7:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 8:
        this.$ = [$$[$0]];
        break;
      case 9:
        this.$ = {name:"topdecl-decl", decl:$$[$0], pos:this._$};
        break;
      case 10:
        this.$ = {name:"topdecl-data", typ:$$[$0], constrs:[], pos:this._$};
        break;
      case 11:
        this.$ = {name:"topdecl-data", typ:$$[$0 - 2], constrs:$$[$0], pos:this._$};
        break;
      case 12:
        this.$ = $$[$0];
        break;
      case 13:
        this.$ = [];
        break;
      case 14:
        this.$ = $$[$0 - 1];
        break;
      case 15:
        this.$ = [];
        break;
      case 16:
        this.$ = $$[$0 - 2];
        break;
      case 17:
        ($$[$0 - 2]).push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 18:
        this.$ = [$$[$0]];
        break;
      case 19:
        this.$ = {name:"decl-fun", lhs:$$[$0 - 1], rhs:$$[$0], pos:this._$};
        break;
      case 21:
        this.$ = {name:"fun-lhs", ident:$$[$0 - 1], args:$$[$0], pos:this._$};
        break;
      case 22:
        this.$ = {name:"fun-lhs", ident:$$[$0], args:[], pos:this._$};
        break;
      case 23:
        this.$ = $$[$0];
        break;
      case 24:
        this.$ = {name:"infixl", num:$$[$0 - 1], ops:$$[$0], pos:this._$};
        break;
      case 25:
        this.$ = {name:"infixr", num:$$[$0 - 1], ops:$$[$0], pos:this._$};
        break;
      case 26:
        this.$ = {name:"infix", num:$$[$0 - 1], ops:$$[$0], pos:this._$};
        break;
      case 27:
        this.$ = {name:"simpletype", tycon:$$[$0], vars:[], pos:this._$};
        break;
      case 28:
        this.$ = {name:"simpletype", tycon:$$[$0 - 1], vars:$$[$0], pos:this._$};
        break;
      case 29:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 30:
        this.$ = [$$[$0]];
        break;
      case 31:
        this.$ = {name:"constr", dacon:$$[$0], types:[], pos:this._$};
        break;
      case 32:
        this.$ = {name:"constr", dacon:$$[$0 - 1], types:$$[$0], pos:this._$};
        break;
      case 33:
        $$[$0 - 1].push($$[$0]);
        this.$ = $$[$0 - 1];
        break;
      case 34:
        this.$ = [$$[$0]];
        break;
      case 35:
        this.$ = $$[$0];
        break;
      case 36:
        this.$ = $$[$0 - 1];
        break;
      case 37:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 38:
        this.$ = [$$[$0]];
        break;
      case 39:
        this.$ = {name:"export-qvar", exp:$$[$0], pos:this._$};
        break;
      case 40:
        this.$ = {name:"export-module", exp:$$[$0], pos:this._$};
        break;
      case 41:
        this.$ = {name:"export-type-unspec", exp:$$[$0], pos:this._$};
        break;
      case 42:
        this.$ = {name:"export-type-all", exp:$$[$0 - 3], pos:this._$};
        break;
      case 43:
        this.$ = {name:"export-type-vars", exp:$$[$0 - 3], vars:$$[$0 - 1], pos:this._$};
        break;
      case 44:
        this.$ = {name:"impdecl", modid:$$[$0], pos:this._$};
        break;
      case 45:
        this.$ = {name:"impdecl", modid:$$[$0 - 3], hiding:false, imports:$$[$0 - 1], pos:this._$};
        break;
      case 46:
        this.$ = {name:"impdecl", modid:$$[$0 - 4], hiding:true, imports:$$[$0 - 1], pos:this._$};
        break;
      case 47:
        this.$ = $$[$0];
        break;
      case 48:
        this.$ = $$[$0 - 1];
        break;
      case 49:
        this.$ = [];
        break;
      case 50:
        this.$ = [];
        break;
      case 51:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 52:
        this.$ = [$$[$0]];
        break;
      case 53:
        this.$ = {name:"import-var", varname:$$[$0], pos:this._$};
        break;
      case 54:
        this.$ = {name:"import-tycon", tycon:$$[$0], all:false, pos:this._$};
        break;
      case 55:
        this.$ = {name:"import-tycon", tycon:$$[$0 - 3], all:true, pos:this._$};
        break;
      case 56:
        this.$ = {name:"import-tycon", tycon:$$[$0 - 3], all:false, list:$$[$0 - 1], pos:this._$};
        break;
      case 57:
        this.$ = {name:"constrained-exp", exp:$$[$0 - 2], sig:"int", pos:this._$};
        break;
      case 58:
        this.$ = $$[$0];
        break;
      case 59:
        ($$[$0 - 1]).push($$[$0]);
        this.$ = {name:"infixexp", exps:$$[$0 - 1], pos:this._$};
        break;
      case 60:
        ($$[$0 - 2]).push($$[$0 - 1], $$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 61:
        ($$[$0 - 1]).push($$[$0]);
        this.$ = $$[$0];
        break;
      case 62:
        this.$ = [];
        break;
      case 63:
        this.$ = {name:"ite", e1:$$[$0 - 4], e2:$$[$0 - 2], e3:$$[$0], pos:this._$};
        break;
      case 64:
        this.$ = {name:"application", exps:$$[$0], pos:this._$};
        break;
      case 65:
        this.$ = {name:"lambda", args:$$[$0 - 2], rhs:$$[$0], pos:this._$};
        break;
      case 66:
        this.$ = {name:"case", exp:$$[$0 - 4], alts:$$[$0 - 1], pos:this._$};
        break;
      case 67:
        this.$ = {name:"let", decls:$$[$0 - 2], exp:$$[$0], pos:this._$};
        break;
      case 68:
        this.$ = [$$[$0]];
        break;
      case 69:
        ($$[$0 - 1]).push($$[$0]);
        this.$ = $$[$0 - 1];
        break;
      case 70:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 71:
        this.$ = [$$[$0]];
        break;
      case 72:
        this.$ = {name:"alt", pat:$$[$0 - 2], exp:$$[$0]};
        break;
      case 73:
        this.$ = $$[$0];
        break;
      case 74:
        this.$ = [];
        break;
      case 75:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 76:
        this.$ = [$$[$0]];
        break;
      case 77:
        this.$ = $$[$0];
        break;
      case 78:
        this.$ = $$[$0];
        break;
      case 79:
        this.$ = $$[$0];
        break;
      case 80:
        this.$ = $$[$0];
        break;
      case 81:
        this.$ = $$[$0 - 1];
        break;
      case 82:
        this.$ = $$[$0];
        break;
      case 83:
        $$[$0 - 1].unshift($$[$0 - 3]);
        this.$ = {name:"tuple", members:$$[$0 - 1], pos:this._$};
        break;
      case 84:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 85:
        this.$ = [$$[$0]];
        break;
      case 86:
        this.$ = new JSHC.ModName($$[$0], this._$, yy.lexer.previous.qual);
        break;
      case 87:
        this.$ = new JSHC.ModName($$[$0], this._$);
        break;
      case 88:
        this.$ = {name:"qop", id:$$[$0], pos:this._$};
        break;
      case 89:
        this.$ = {name:"qop", id:$$[$0], pos:this._$};
        break;
      case 90:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 91:
        this.$ = [$$[$0]];
        break;
      case 92:
        this.$ = $$[$0];
        break;
      case 93:
        this.$ = $$[$0];
        break;
      case 94:
        this.$ = {name:"conop", id:$$[$0], pos:this._$};
        break;
      case 95:
        this.$ = {name:"conop-var", id:$$[$0 - 2], pos:this._$};
        break;
      case 96:
        this.$ = {name:"qvarop", id:$$[$0], pos:this._$};
        break;
      case 97:
        this.$ = $$[$0];
        break;
      case 98:
        this.$ = {name:"qvarop-var", id:$$[$0 - 1], pos:this._$};
        break;
      case 99:
        this.$ = {name:"varop", id:$$[$0], pos:this._$};
        break;
      case 100:
        this.$ = {name:"varop-var", id:$$[$0 - 1], pos:this._$};
        break;
      case 101:
        $$[$0 - 1].push($$[$0]);
        this.$ = $$[$0 - 1];
        break;
      case 102:
        this.$ = [$$[$0]];
        break;
      case 103:
        this.$ = new JSHC.TyVar($$[$0], this._$);
        break;
      case 104:
        this.$ = new JSHC.TyCon($$[$0], this._$);
        break;
      case 105:
        this.$ = new JSHC.TyCon($$[$0], this._$, yy.lexer.previous.qual);
        break;
      case 106:
        this.$ = $$[$0];
        break;
      case 107:
        this.$ = new JSHC.DaCon($$[$0], this._$, false);
        break;
      case 108:
        this.$ = new JSHC.DaCon($$[$0 - 1], this._$, true);
        break;
      case 109:
        this.$ = new JSHC.DaCon($$[$0], this._$, false, yy.lexer.previous.qual);
        break;
      case 110:
        this.$ = new JSHC.DaCon($$[$01], this._$, true, yy.lexer.previous.qual);
        break;
      case 111:
        this.$ = $$[$0];
        break;
      case 113:
        this.$ = new JSHC.VarName($$[$0], this._$, false);
        break;
      case 114:
        this.$ = new JSHC.VarName($$[$0 - 1], this._$, true);
        break;
      case 115:
        this.$ = new JSHC.VarName($$[$0], this._$, false, yy.lexer.previous.qual);
        break;
      case 116:
        this.$ = new JSHC.VarName($$[$0 - 1], this._$, true, yy.lexer.previous.qual);
        break;
      case 117:
        this.$ = $$[$0];
        break;
      case 118:
        this.$ = new JSHC.DaCon($$[$0], this._$, true, yy.lexer.previous.qual);
        break;
      case 119:
        this.$ = new JSHC.DaCon($$[$0], this._$, true, yy.lexer.previous.qual);
        break;
      case 120:
        this.$ = $$[$0];
        break;
      case 121:
        this.$ = $$[$0];
        break;
      case 122:
        this.$ = $$[$0];
        break;
      case 123:
        this.$ = $$[$0];
        break;
      case 124:
        this.$ = $$[$0];
        break;
      case 125:
        this.$ = {name:"conpat", con:$$[$0 - 1], pats:$$[$0]};
        break;
      case 126:
        this.$ = [$$[$0]];
        break;
      case 127:
        $$[$0 - 1].push($$[$0]);
        this.$ = $$[$0 - 1];
        break;
      case 128:
        this.$ = $$[$0];
        break;
      case 129:
        this.$ = $$[$0];
        break;
      case 130:
        this.$ = $$[$0];
        break;
      case 131:
        this.$ = $$[$0];
        break;
      case 132:
        $$[$0 - 1].unshift($$[$0 - 3]);
        this.$ = {name:"tuple_pat", members:$$[$0 - 1], pos:this._$};
        break;
      case 133:
        $$[$0 - 2].push($$[$0]);
        this.$ = $$[$0 - 2];
        break;
      case 134:
        this.$ = [$$[$0]];
        break;
      case 135:
        this.$ = {name:"integer-lit", value:Number($$[$0]), pos:this._$};
        break;
    }
}
,
table: [{3:1,4:2,6:[1,3],9:4,13:[1,5]},{1:[3]},{5:[1,6]},{7:7,83:[1,8],84:[1,9]},{5:[2,4]},{14:10,16:11,18:12,19:13,20:[1,14],24:15,27:16,29:17,52:[1,18],30:19,33:[1,20],36:[1,21],37:[1,22],95:[1,23],10:[1,24]},{1:[2,1]},{8:[1,25],10:[1,26]},{8:[2,86],10:[2,86],17:[2,86],15:[2,86],54:[2,86],12:[2,86],46:[2,86]},{8:[2,87],10:[2,87],17:[2,87],15:[2,87],54:[2,87],12:[2,87],46:[2,87]},{15:[1,27]},{17:[1,28],15:[2,6]},{15:[2,8],17:[2,8]},{17:[2,9],15:[2,9]},{21:29,38:30,84:[1,31]},{17:[2,12],15:[2,12]},{28:32,22:[1,33]},{15:[2,20],17:[2,20],2:[2,20]},{7:34,83:[1,8],84:[1,9]},{31:35,103:36,30:37,80:38,34:39,104:40,95:[1,23],10:[1,41],97:42,106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49],22:[2,22]},{34:50,106:[1,43]},{34:51,106:[1,43]},{34:52,106:[1,43]},{95:[2,113],10:[2,113],83:[2,113],99:[2,113],100:[2,113],84:[2,113],106:[2,113],22:[2,113],46:[2,113],12:[2,113],15:[2,113],17:[2,113],58:[2,113],92:[2,113],94:[2,113],91:[2,113],86:[2,113],65:[2,113],71:[2,113],66:[2,113],2:[2,113],93:[2,113],69:[2,113]},{94:[1,53]},{9:54,13:[1,5]},{11:55,45:56,47:57,48:58,6:[1,59],49:60,93:[1,61],10:[1,62],30:63,83:[1,64],38:65,95:[1,23],84:[1,31]},{5:[2,5]},{18:66,19:13,20:[1,14],24:15,27:16,29:17,52:[1,18],30:19,33:[1,20],36:[1,21],37:[1,22],95:[1,23],10:[1,24]},{22:[1,67],17:[2,10],15:[2,10]},{39:68,96:69,95:[1,70],15:[2,27],17:[2,27],22:[2,27]},{22:[2,104],17:[2,104],15:[2,104],95:[2,104],10:[2,104],46:[2,104],12:[2,104],40:[2,104],83:[2,104],84:[2,104]},{15:[2,19],17:[2,19],2:[2,19]},{32:71,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{10:[1,74],54:[1,75],15:[2,44],17:[2,44]},{103:76,30:37,80:38,34:39,104:40,95:[1,23],10:[1,41],97:42,106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49],22:[2,21]},{22:[2,126],95:[2,126],10:[2,126],83:[2,126],99:[2,126],100:[2,126],84:[2,126],106:[2,126],46:[2,126],12:[2,126],69:[2,126]},{22:[2,128],106:[2,128],84:[2,128],100:[2,128],99:[2,128],83:[2,128],10:[2,128],95:[2,128],46:[2,128],69:[2,128],12:[2,128]},{22:[2,129],106:[2,129],84:[2,129],100:[2,129],99:[2,129],83:[2,129],10:[2,129],95:[2,129],46:[2,129],69:[2,129],12:[2,129]},{22:[2,130],106:[2,130],84:[2,130],100:[2,130],99:[2,130],83:[2,130],10:[2,130],95:[2,130],46:[2,130],69:[2,130],12:[2,130]},{22:[2,131],106:[2,131],84:[2,131],100:[2,131],99:[2,131],83:[2,131],10:[2,131],95:[2,131],46:[2,131],69:[2,131],12:[2,131]},{94:[1,53],77:77,90:[1,78],102:79,103:80,80:81,30:37,34:39,104:40,97:42,95:[1,23],10:[1,41],106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{22:[2,112],95:[2,112],10:[2,112],83:[2,112],99:[2,112],100:[2,112],84:[2,112],106:[2,112],46:[2,112],86:[2,112],91:[2,112],94:[2,112],92:[2,112],58:[2,112],17:[2,112],15:[2,112],93:[2,112],2:[2,112],12:[2,112],66:[2,112],71:[2,112],65:[2,112],69:[2,112]},{22:[2,135],95:[2,135],10:[2,135],83:[2,135],99:[2,135],100:[2,135],84:[2,135],106:[2,135],94:[2,135],91:[2,135],90:[2,135],46:[2,135],86:[2,135],92:[2,135],58:[2,135],17:[2,135],15:[2,135],93:[2,135],2:[2,135],12:[2,135],66:[2,135],71:[2,135],65:[2,135],69:[2,135]},{22:[2,109],106:[2,109],84:[2,109],100:[2,109],99:[2,109],83:[2,109],10:[2,109],95:[2,109],46:[2,109],15:[2,109],17:[2,109],58:[2,109],92:[2,109],94:[2,109],91:[2,109],86:[2,109],65:[2,109],71:[2,109],12:[2,109],66:[2,109],2:[2,109],93:[2,109],69:[2,109]},{22:[2,110],106:[2,110],84:[2,110],100:[2,110],99:[2,110],83:[2,110],10:[2,110],95:[2,110],46:[2,110],15:[2,110],17:[2,110],58:[2,110],92:[2,110],94:[2,110],91:[2,110],86:[2,110],65:[2,110],71:[2,110],12:[2,110],66:[2,110],2:[2,110],93:[2,110],69:[2,110]},{22:[2,111],106:[2,111],84:[2,111],100:[2,111],99:[2,111],83:[2,111],10:[2,111],95:[2,111],46:[2,111],15:[2,111],17:[2,111],58:[2,111],92:[2,111],94:[2,111],91:[2,111],86:[2,111],65:[2,111],71:[2,111],12:[2,111],66:[2,111],2:[2,111],93:[2,111],69:[2,111]},{22:[2,118],95:[2,118],10:[2,118],83:[2,118],99:[2,118],100:[2,118],84:[2,118],106:[2,118],46:[2,118],86:[2,118],91:[2,118],94:[2,118],92:[2,118],58:[2,118],17:[2,118],15:[2,118],93:[2,118],2:[2,118],12:[2,118],66:[2,118],71:[2,118],65:[2,118],69:[2,118]},{22:[2,119],95:[2,119],10:[2,119],83:[2,119],99:[2,119],100:[2,119],84:[2,119],106:[2,119],46:[2,119],86:[2,119],91:[2,119],94:[2,119],92:[2,119],58:[2,119],17:[2,119],15:[2,119],93:[2,119],2:[2,119],12:[2,119],66:[2,119],71:[2,119],65:[2,119],69:[2,119]},{22:[2,107],95:[2,107],10:[2,107],83:[2,107],99:[2,107],100:[2,107],84:[2,107],106:[2,107],46:[2,107],15:[2,107],17:[2,107],40:[2,107],86:[2,107],91:[2,107],94:[2,107],92:[2,107],58:[2,107],93:[2,107],2:[2,107],12:[2,107],66:[2,107],71:[2,107],65:[2,107],69:[2,107]},{35:82,87:83,88:84,89:85,94:[1,86],91:[1,87],90:[1,88]},{35:89,87:83,88:84,89:85,94:[1,86],91:[1,87],90:[1,88]},{35:90,87:83,88:84,89:85,94:[1,86],91:[1,87],90:[1,88]},{12:[1,91]},{5:[2,2]},{12:[1,92]},{46:[1,93],12:[2,35]},{12:[2,38],46:[2,38]},{46:[2,39],12:[2,39]},{7:94,83:[1,8],84:[1,9]},{10:[1,95],46:[2,41],12:[2,41]},{12:[2,115],46:[2,115],86:[2,115],91:[2,115],94:[2,115],92:[2,115],58:[2,115],17:[2,115],15:[2,115],93:[2,115],10:[2,115],95:[2,115],83:[2,115],99:[2,115],100:[2,115],84:[2,115],106:[2,115],2:[2,115],66:[2,115],71:[2,115],65:[2,115]},{92:[1,96],94:[1,53]},{12:[2,117],46:[2,117],86:[2,117],91:[2,117],94:[2,117],92:[2,117],58:[2,117],17:[2,117],15:[2,117],93:[2,117],10:[2,117],95:[2,117],83:[2,117],99:[2,117],100:[2,117],84:[2,117],106:[2,117],2:[2,117],66:[2,117],71:[2,117],65:[2,117]},{12:[2,105],46:[2,105],10:[2,105],95:[2,105],84:[2,105],83:[2,105],40:[2,105],17:[2,105],15:[2,105]},{12:[2,106],46:[2,106],10:[2,106],95:[2,106],84:[2,106],83:[2,106],40:[2,106],17:[2,106],15:[2,106]},{15:[2,7],17:[2,7]},{23:97,41:98,42:99,84:[1,49],10:[1,100]},{96:101,95:[1,70],15:[2,28],17:[2,28],22:[2,28]},{22:[2,102],17:[2,102],15:[2,102],95:[2,102]},{95:[2,103],15:[2,103],17:[2,103],22:[2,103],40:[2,103],83:[2,103],84:[2,103]},{17:[2,23],15:[2,23],2:[2,23]},{58:[1,102],15:[2,58],17:[2,58],2:[2,58],65:[2,58],71:[2,58],12:[2,58],46:[2,58],66:[2,58],86:[2,58],91:[2,58],94:[2,58],92:[2,58]},{61:103,63:[1,104],64:[1,105],67:106,68:[1,107],70:[1,108],73:[1,109],75:110,48:111,80:112,34:113,10:[1,114],81:115,93:[1,61],30:63,97:42,106:[1,43],95:[1,23],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{53:116,55:117,46:[1,118],56:119,30:120,38:121,95:[1,23],10:[1,24],84:[1,31],12:[2,50]},{10:[1,122]},{22:[2,127],95:[2,127],10:[2,127],83:[2,127],99:[2,127],100:[2,127],84:[2,127],106:[2,127],46:[2,127],12:[2,127],69:[2,127]},{46:[1,123]},{12:[1,124]},{46:[2,123],12:[2,123],69:[2,123]},{46:[2,124],12:[2,124],69:[2,124]},{31:125,103:36,30:37,80:38,34:39,104:40,95:[1,23],10:[1,41],97:42,106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49],46:[2,129],12:[2,129],69:[2,129]},{46:[1,126],17:[2,24],15:[2,24],2:[2,24]},{15:[2,91],17:[2,91],46:[2,91],2:[2,91]},{46:[2,92],17:[2,92],15:[2,92],2:[2,92]},{46:[2,93],17:[2,93],15:[2,93],2:[2,93]},{15:[2,99],17:[2,99],46:[2,99],2:[2,99],73:[2,99],70:[2,99],68:[2,99],106:[2,99],84:[2,99],100:[2,99],99:[2,99],83:[2,99],95:[2,99],10:[2,99],93:[2,99],64:[2,99],63:[2,99]},{95:[1,127],84:[1,128]},{15:[2,94],17:[2,94],46:[2,94],2:[2,94]},{46:[1,126],17:[2,25],15:[2,25],2:[2,25]},{46:[1,126],17:[2,26],15:[2,26],2:[2,26]},{95:[2,114],10:[2,114],83:[2,114],99:[2,114],100:[2,114],84:[2,114],106:[2,114],22:[2,114],46:[2,114],12:[2,114],15:[2,114],17:[2,114],58:[2,114],92:[2,114],94:[2,114],91:[2,114],86:[2,114],65:[2,114],71:[2,114],66:[2,114],2:[2,114],93:[2,114],69:[2,114]},{8:[1,129]},{47:130,48:58,6:[1,59],49:60,93:[1,61],10:[1,62],30:63,83:[1,64],38:65,95:[1,23],84:[1,31],12:[2,36]},{46:[2,40],12:[2,40]},{50:[1,131],51:132,78:133,79:134,42:135,84:[1,49],10:[1,100],12:[2,74]},{12:[1,136]},{40:[1,137],17:[2,11],15:[2,11]},{15:[2,30],17:[2,30],40:[2,30]},{43:138,44:139,101:140,96:141,49:142,95:[1,70],83:[1,64],38:65,84:[1,31],40:[2,31],17:[2,31],15:[2,31]},{90:[1,78]},{22:[2,101],17:[2,101],15:[2,101],95:[2,101]},{59:[1,143]},{62:144,85:145,86:[1,146],92:[1,147],88:148,91:[1,149],94:[1,86],58:[2,59],17:[2,59],15:[2,59],2:[2,59],65:[2,59],71:[2,59],46:[2,59],12:[2,59],66:[2,59]},{64:[2,61],93:[2,61],10:[2,61],95:[2,61],83:[2,61],99:[2,61],100:[2,61],84:[2,61],106:[2,61],68:[2,61],70:[2,61],73:[2,61],63:[2,61]},{32:150,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{75:151,48:111,80:112,34:113,10:[1,114],81:115,93:[1,61],30:63,97:42,106:[1,43],95:[1,23],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49],15:[2,64],17:[2,64],58:[2,64],92:[2,64],94:[2,64],91:[2,64],86:[2,64],65:[2,64],71:[2,64],12:[2,64],46:[2,64],66:[2,64],2:[2,64]},{31:152,103:36,30:37,80:38,34:39,104:40,95:[1,23],10:[1,41],97:42,106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{32:153,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{25:154,13:[1,155]},{86:[2,68],91:[2,68],94:[2,68],92:[2,68],58:[2,68],17:[2,68],15:[2,68],93:[2,68],10:[2,68],95:[2,68],83:[2,68],99:[2,68],100:[2,68],84:[2,68],106:[2,68],2:[2,68],12:[2,68],46:[2,68],66:[2,68],71:[2,68],65:[2,68]},{15:[2,78],17:[2,78],58:[2,78],92:[2,78],94:[2,78],91:[2,78],86:[2,78],65:[2,78],71:[2,78],12:[2,78],46:[2,78],66:[2,78],2:[2,78],106:[2,78],84:[2,78],100:[2,78],99:[2,78],83:[2,78],95:[2,78],10:[2,78],93:[2,78]},{15:[2,79],17:[2,79],58:[2,79],92:[2,79],94:[2,79],91:[2,79],86:[2,79],65:[2,79],71:[2,79],12:[2,79],46:[2,79],66:[2,79],2:[2,79],106:[2,79],84:[2,79],100:[2,79],99:[2,79],83:[2,79],95:[2,79],10:[2,79],93:[2,79]},{15:[2,80],17:[2,80],58:[2,80],92:[2,80],94:[2,80],91:[2,80],86:[2,80],65:[2,80],71:[2,80],12:[2,80],46:[2,80],66:[2,80],2:[2,80],106:[2,80],84:[2,80],100:[2,80],99:[2,80],83:[2,80],95:[2,80],10:[2,80],93:[2,80]},{32:156,92:[1,96],94:[1,53],90:[1,78],57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{15:[2,82],17:[2,82],58:[2,82],92:[2,82],94:[2,82],91:[2,82],86:[2,82],65:[2,82],71:[2,82],12:[2,82],46:[2,82],66:[2,82],2:[2,82],106:[2,82],84:[2,82],100:[2,82],99:[2,82],83:[2,82],95:[2,82],10:[2,82],93:[2,82]},{12:[1,157]},{46:[1,158],12:[2,47]},{12:[2,49]},{12:[2,52],46:[2,52]},{46:[2,53],12:[2,53]},{10:[1,159],46:[2,54],12:[2,54]},{53:160,55:117,46:[1,118],56:119,30:120,38:121,95:[1,23],10:[1,24],84:[1,31],12:[2,50]},{105:161,77:162,102:79,103:80,80:81,30:37,34:39,104:40,97:42,95:[1,23],10:[1,41],106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{22:[2,108],95:[2,108],10:[2,108],83:[2,108],99:[2,108],100:[2,108],84:[2,108],106:[2,108],46:[2,108],15:[2,108],17:[2,108],40:[2,108],86:[2,108],91:[2,108],94:[2,108],92:[2,108],58:[2,108],93:[2,108],2:[2,108],12:[2,108],66:[2,108],71:[2,108],65:[2,108],69:[2,108]},{103:76,30:37,80:38,34:39,104:40,95:[1,23],10:[1,41],97:42,106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49],46:[2,125],12:[2,125],69:[2,125]},{87:163,88:84,89:85,94:[1,86],91:[1,87],90:[1,88]},{91:[1,164]},{91:[1,165]},{9:166,13:[1,5]},{12:[2,37],46:[2,37]},{12:[1,167]},{12:[1,168]},{46:[1,169],12:[2,73]},{12:[2,76],46:[2,76]},{46:[2,77],12:[2,77]},{12:[2,116],46:[2,116],86:[2,116],91:[2,116],94:[2,116],92:[2,116],58:[2,116],17:[2,116],15:[2,116],93:[2,116],10:[2,116],95:[2,116],83:[2,116],99:[2,116],100:[2,116],84:[2,116],106:[2,116],2:[2,116],66:[2,116],71:[2,116],65:[2,116]},{41:170,42:99,84:[1,49],10:[1,100]},{44:171,101:140,96:141,49:142,95:[1,70],83:[1,64],38:65,84:[1,31],40:[2,32],17:[2,32],15:[2,32]},{15:[2,34],17:[2,34],40:[2,34],83:[2,34],84:[2,34],95:[2,34]},{95:[2,120],84:[2,120],83:[2,120],40:[2,120],17:[2,120],15:[2,120]},{95:[2,121],84:[2,121],83:[2,121],40:[2,121],17:[2,121],15:[2,121]},{15:[2,122],17:[2,122],40:[2,122],83:[2,122],84:[2,122],95:[2,122]},{15:[2,57],17:[2,57],2:[2,57],65:[2,57],71:[2,57],12:[2,57],46:[2,57],66:[2,57],86:[2,57],91:[2,57],94:[2,57],92:[2,57],58:[2,57]},{64:[2,60],93:[2,60],10:[2,60],95:[2,60],83:[2,60],99:[2,60],100:[2,60],84:[2,60],106:[2,60],68:[2,60],70:[2,60],73:[2,60],63:[2,60]},{73:[2,88],70:[2,88],68:[2,88],106:[2,88],84:[2,88],100:[2,88],99:[2,88],83:[2,88],95:[2,88],10:[2,88],93:[2,88],64:[2,88],63:[2,88]},{73:[2,89],70:[2,89],68:[2,89],106:[2,89],84:[2,89],100:[2,89],99:[2,89],83:[2,89],95:[2,89],10:[2,89],93:[2,89],64:[2,89],63:[2,89]},{64:[2,96],93:[2,96],10:[2,96],95:[2,96],83:[2,96],99:[2,96],100:[2,96],84:[2,96],106:[2,96],68:[2,96],70:[2,96],73:[2,96],63:[2,96]},{64:[2,97],93:[2,97],10:[2,97],95:[2,97],83:[2,97],99:[2,97],100:[2,97],84:[2,97],106:[2,97],68:[2,97],70:[2,97],73:[2,97],63:[2,97]},{93:[1,172],95:[1,127]},{65:[1,173]},{86:[2,69],91:[2,69],94:[2,69],92:[2,69],58:[2,69],17:[2,69],15:[2,69],93:[2,69],10:[2,69],95:[2,69],83:[2,69],99:[2,69],100:[2,69],84:[2,69],106:[2,69],2:[2,69],12:[2,69],46:[2,69],66:[2,69],71:[2,69],65:[2,69]},{69:[1,174],103:76,30:37,80:38,34:39,104:40,95:[1,23],10:[1,41],97:42,106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{71:[1,175]},{74:[1,176]},{15:[1,177],26:178,2:[1,179],19:180,27:16,29:17,30:19,33:[1,20],36:[1,21],37:[1,22],95:[1,23],10:[1,24]},{12:[1,181],46:[1,182]},{15:[2,45],17:[2,45]},{56:183,30:120,38:121,95:[1,23],10:[1,24],84:[1,31],12:[2,48]},{50:[1,184],51:185,78:133,79:134,42:135,84:[1,49],10:[1,100],12:[2,74]},{12:[1,186]},{12:[1,187],46:[1,188]},{12:[2,134],46:[2,134]},{15:[2,90],17:[2,90],46:[2,90],2:[2,90]},{15:[2,100],17:[2,100],46:[2,100],2:[2,100],73:[2,100],70:[2,100],68:[2,100],106:[2,100],84:[2,100],100:[2,100],99:[2,100],83:[2,100],95:[2,100],10:[2,100],93:[2,100],64:[2,100],63:[2,100]},{15:[2,95],17:[2,95],46:[2,95],2:[2,95]},{5:[2,3]},{46:[2,42],12:[2,42]},{46:[2,43],12:[2,43]},{79:189,42:135,84:[1,49],10:[1,100]},{15:[2,29],17:[2,29],40:[2,29]},{15:[2,33],17:[2,33],40:[2,33],83:[2,33],84:[2,33],95:[2,33]},{91:[1,190]},{32:191,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{32:192,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{13:[1,193]},{32:194,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{74:[2,13]},{15:[1,195],2:[1,196],17:[1,197]},{15:[1,198]},{15:[2,18],2:[2,18],17:[2,18]},{15:[2,81],17:[2,81],58:[2,81],92:[2,81],94:[2,81],91:[2,81],86:[2,81],65:[2,81],71:[2,81],12:[2,81],46:[2,81],66:[2,81],2:[2,81],106:[2,81],84:[2,81],100:[2,81],99:[2,81],83:[2,81],95:[2,81],10:[2,81],93:[2,81]},{82:199,32:200,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{12:[2,51],46:[2,51]},{12:[1,201]},{12:[1,202]},{15:[2,46],17:[2,46]},{22:[2,132],95:[2,132],10:[2,132],83:[2,132],99:[2,132],100:[2,132],84:[2,132],106:[2,132],46:[2,132],12:[2,132],69:[2,132]},{77:203,102:79,103:80,80:81,30:37,34:39,104:40,97:42,95:[1,23],10:[1,41],106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{12:[2,75],46:[2,75]},{64:[2,98],93:[2,98],10:[2,98],95:[2,98],83:[2,98],99:[2,98],100:[2,98],84:[2,98],106:[2,98],68:[2,98],70:[2,98],73:[2,98],63:[2,98]},{66:[1,204]},{15:[2,65],17:[2,65],58:[2,65],92:[2,65],94:[2,65],91:[2,65],86:[2,65],65:[2,65],71:[2,65],12:[2,65],46:[2,65],66:[2,65],2:[2,65]},{72:205,76:206,77:207,102:79,103:80,80:81,30:37,34:39,104:40,97:42,95:[1,23],10:[1,41],106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{15:[2,67],17:[2,67],58:[2,67],92:[2,67],94:[2,67],91:[2,67],86:[2,67],65:[2,67],71:[2,67],12:[2,67],46:[2,67],66:[2,67],2:[2,67]},{74:[2,14]},{15:[1,208]},{19:209,27:16,29:17,30:19,33:[1,20],36:[1,21],37:[1,22],95:[1,23],10:[1,24]},{74:[2,15]},{12:[1,210],46:[1,211]},{12:[2,85],46:[2,85]},{46:[2,55],12:[2,55]},{46:[2,56],12:[2,56]},{12:[2,133],46:[2,133]},{32:212,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{15:[1,213],17:[1,214]},{15:[2,71],17:[2,71]},{69:[1,215]},{74:[2,16]},{15:[2,17],2:[2,17],17:[2,17]},{86:[2,83],91:[2,83],94:[2,83],92:[2,83],58:[2,83],17:[2,83],15:[2,83],93:[2,83],10:[2,83],95:[2,83],83:[2,83],99:[2,83],100:[2,83],84:[2,83],106:[2,83],2:[2,83],12:[2,83],46:[2,83],66:[2,83],71:[2,83],65:[2,83]},{32:216,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{15:[2,63],17:[2,63],58:[2,63],92:[2,63],94:[2,63],91:[2,63],86:[2,63],65:[2,63],71:[2,63],12:[2,63],46:[2,63],66:[2,63],2:[2,63]},{15:[2,66],17:[2,66],58:[2,66],92:[2,66],94:[2,66],91:[2,66],86:[2,66],65:[2,66],71:[2,66],12:[2,66],46:[2,66],66:[2,66],2:[2,66]},{76:217,77:207,102:79,103:80,80:81,30:37,34:39,104:40,97:42,95:[1,23],10:[1,41],106:[1,43],83:[1,44],98:45,42:46,99:[1,47],100:[1,48],84:[1,49]},{32:218,57:72,60:73,64:[2,62],93:[2,62],10:[2,62],95:[2,62],83:[2,62],99:[2,62],100:[2,62],84:[2,62],106:[2,62],68:[2,62],70:[2,62],73:[2,62],63:[2,62]},{12:[2,84],46:[2,84]},{15:[2,70],17:[2,70]},{17:[2,72],15:[2,72]}],
defaultActions: {4:[2,4],6:[2,1],27:[2,5],54:[2,2],118:[2,49],166:[2,3],177:[2,13],195:[2,14],198:[2,15],208:[2,16]},
parseError: 
function parseError(str, hash) {
    throw new Error(str);
}
,
parse: 
function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    if (typeof this.yy.parseError === "function") {
        this.parseError = this.yy.parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null) {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            if (!recovering) {
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                }
                var errStr = "";
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ");
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : ("'" + (this.terminals_[symbol] || symbol) + "'"));
                }
                this.parseError(errStr, {text:this.lexer.match, token:this.terminals_[symbol] || symbol, line:this.lexer.yylineno, loc:yyloc, expected:expected});
            }
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || "Parsing halted.");
                }
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }
            while (1) {
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || "Parsing halted.");
                }
                popStack(1);
                state = stack[stack.length - 1];
            }
            preErrorSymbol = symbol;
            symbol = TERROR;
            state = stack[stack.length - 1];
            action = table[state] && table[state][TERROR];
            recovering = 3;
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
          case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
          case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line:lstack[lstack.length - (len || 1)].first_line, last_line:lstack[lstack.length - 1].last_line, first_column:lstack[lstack.length - (len || 1)].first_column, last_column:lstack[lstack.length - 1].last_column};
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
          case 3:
            return true;
        }
    }
    return true;
}
};
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = JSHCparser;
exports.parse = function () { return JSHCparser.parse.apply(JSHCparser, arguments); }
exports.main = 
function commonjsMain(args) {
    if (!args[1]) {
        throw new Error("Usage: " + args[0] + " FILE");
    }
    if (typeof process !== "undefined") {
        var source = require("fs").readFileSync(require("path").join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset:"utf-8"});
    }
    return exports.parser.parse(source);
}

if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}