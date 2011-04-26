//> This file is part of Ymacs, an Emacs-like editor for the Web
//> http://www.ymacs.org/
//>
//> Copyright (c) 2009-2010, Mihai Bazon, Dynarch.com.  All rights reserved.
//>
//> Redistribution and use in source and binary forms, with or without
//> modification, are permitted provided that the following conditions are
//> met:
//>
//>     * Redistributions of source code must retain the above copyright
//>       notice, this list of conditions and the following disclaimer.
//>
//>     * Redistributions in binary form must reproduce the above copyright
//>       notice, this list of conditions and the following disclaimer in
//>       the documentation and/or other materials provided with the
//>       distribution.
//>
//>     * Neither the name of Dynarch.com nor the names of its contributors
//>       may be used to endorse or promote products derived from this
//>       software without specific prior written permission.
//>
//> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
//> EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//> IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
//> PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE
//> FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//> CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//> SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//> INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//> CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//> ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
//> THE POSSIBILITY OF SUCH DAMAGE.

// @require ymacs-buffer.js

Ymacs_Buffer.newCommands({

        get_region: function() {
                return this.getRegion();
        },

        cperl_lineup: Ymacs_Interactive("r", function(begin, end){
                this.cmd("save_excursion", function(){
                        var rcend = this._positionToRowCol(end), max = 0, lines = [];
                        this.cmd("goto_char", begin);
                        this.cmd("forward_whitespace", true);
                        var ch = this.charAt();
                        if (ch.toLowerCase() != ch.toUpperCase()) {
                                this.signalError("Cannot lineup here");
                                return;
                        }
                        while (this._rowcol.row <= rcend.row) {
                                var pos = this.getLine().indexOf(ch);
                                if (pos >= 0) {
                                        if (pos > max)
                                                max = pos;
                                        lines.push([ this._rowcol.row, pos ]);
                                }
                                if (!this.cmd("forward_line"))
                                        break;
                        }
                        ++max;
                        lines.foreach(function(l){
                                this.cmd("goto_char", this._rowColToPosition(l[0], l[1]));
                                this.cmd("insert", " ".x(max - l[1]));
                        }, this);
                });
        }),

        htmlize_region: Ymacs_Interactive("r\nP", function(begin, end, lineNum) {
                this.tokenizer.finishParsing();
                var row = this._positionToRowCol(begin).row,
                    html = String.buffer(),
                    line = row, pad;
                if (lineNum && !lineNum.empty)
                        line = parseInt(lineNum, 10);
                end = this._positionToRowCol(end).row;
                pad = String(end).length;
                while (row <= end) {
                        html("<div class='line'>");
                        if (lineNum)
                                html("<span class='line-number'>", line.zeroPad(pad, " "), "</span>");
                        ++line;
                        html(this._textProperties.getLineHTML(row, this.code[row], null), "</div>\n");
                        ++row;
                }
                html = html.get();
                var tmp = this.ymacs.switchToBuffer("*Htmlize*");
                tmp.setCode(html);
                tmp.cmd("xml_mode", true);
        }),

        execute_extended_command: Ymacs_Interactive("^CM-x ", function(cmd) {
                this.callInteractively(cmd);
        }),

        set_variable: Ymacs_Interactive("vSet variable: \nsTo value: ", function(variable, value) {
                var tmp = parseFloat(value);
                if (!isNaN(tmp))
                        value = tmp;
                this.setq(variable, value);
        }),

        eval_string: Ymacs_Interactive("^MEval string: ", function(code){
                try {
                        var variables = [
                                this,      // buffer
                                this.ymacs // ymacs
                        ];
                        code = new Function("buffer", "ymacs", code);
                        code.apply(this, variables);
                        this.clearTransientMark();
                } catch(ex) {
                        this.signalError(ex.type + ": " + ex.message);
                        if (window.console)
                                console.log(ex);
                }
        }),

        eval_region: Ymacs_Interactive("^r", function(begin, end) {
                this.cmd("eval_string", this.cmd("buffer_substring", begin, end));
        }),

        eval_buffer: Ymacs_Interactive(function(){
                this.cmd("eval_string", this.getCode());
        }),

        toggle_line_numbers: Ymacs_Interactive("^", function(){
                this.whenActiveFrame("toggleLineNumbers");
        }),

        save_file: Ymacs_Interactive("FWrite file: ", function(name){
                var files = this.ymacs.ls_getFileDirectory(name, "file");
                files.dir[files.other[0]] = this.getCode();
                this.ymacs.ls_set(files.store);
                this.signalInfo("Saved in local storage");
        }),

        load_file: Ymacs_Interactive("fFind file: ", function(name){
                var code = this.ymacs.ls_getFileContents(name);
                var buffer = this.ymacs.createBuffer({ name: name });
                buffer.setCode(code);
                this.cmd("switch_to_buffer", name);
        }),

        delete_file: Ymacs_Interactive("fDelete file: ", function(name){
                this.ymacs.ls_getFileContents(name);
                var files = this.ymacs.ls_get();
                delete files[name];
                this.ymacs.ls_set(files);
        }),

        eval_file: Ymacs_Interactive("fEval file: ", function(name){
                this.cmd("eval_string", this.ymacs.ls_getFileContents(name));
        })

});
