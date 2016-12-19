'use babel';

var shell = require("electron").shell;

import {
    CompositeDisposable
} from 'atom';
export default {
    activate(state) {
        this.subscriptions = new CompositeDisposable();
        document.querySelector("atom-pane-container.panes").addEventListener("click", function(e) {
            var editor = atom.workspace.getActiveTextEditor();

            if(!editor) {
                return;
            }

            var isMarkdown = editor.getGrammar().scopeName == "source.gfm"
            /*
            * Does the link have a hyperlink class
            * If so, it doesn't matter if this is a markdown file or not
            * We can just use the normal routine to get the link
            */
            var isNormalHyperlink = false;

            var element = null;

            /*
            * We search the list with parent nodes upwards until we find a link element
            * This is an element with class hyperlink or if we're in markdown an element
            * with class link
            */
            for(var i in e.path) {
                var path = e.path[i];
                if(path.classList != undefined ) {
                    if(path.classList.contains("hyperlink") > 0) {
                        isNormalHyperlink = true;
                        element = path;
                        break;
                    }
                    else if(isMarkdown && path.classList.contains("link") > 0) {
                        element = path;
                        break;
                    }
                }
            }

            // requires https://atom.io/packages/language-hyperlink to highlight hyperlink
            if (element) {
                if (e.ctrlKey || e.metaKey) {
                    /*
                    * Remove cursor that was created by clicking the link
                    * But only if it is not the only cursor.
                    */
                    if(editor.hasMultipleCursors()) {
                        /*
                        * Remove the cursor that is exactly at the position the mouse clicked
                        * and not just the last added cursor.
                        */
                        var screenPos = atom.views.getView(editor).component.screenPositionForMouseEvent(e);
                        var cursor = editor.getCursorAtScreenPosition(screenPos);
                        if(cursor) {
                            cursor.destroy();
                        }
                    }
                    var linkRaw = element.innerText;

                    /*
                    * In markdown links are not in an element with class hyperlink, they have to be parsed.
                    * This also means that in markdown we can click anywhere in the link definition (also the title of the link)
                    * to open it in a browser
                    */
                    if(isMarkdown && !isNormalHyperlink) {
                        /*
                        * Markdown links are of the form [name](url)
                        * Both the parentheses (on the right) have the link class
                        * as well as the whole thing
                        * This RegExp will handle both cases
                        */
                        var exp = /^.*\((.*)\)$/;
                        var matches = exp.exec(linkRaw);
                        if(matches && matches[1]) {
                            linkRaw = matches[1];
                        }
                        else {
                            console.error("Markdown link \"" + linkRaw + "\" cannot be parsed.");
                        }
                    }

                    var link = decodeURI(linkRaw);
                    console.log("Opening " + link + " in browser!");
                    shell.openExternal(link);
                }
            }
        });
    }
};
