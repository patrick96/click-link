'use babel';

var shell = require("electron").shell;

import {
    CompositeDisposable
} from 'atom';
export default {
    activate(state) {
        this.subscriptions = new CompositeDisposable();
        atom.workspace.activePaneContainer.paneContainer.element.addEventListener("click", function(e) {
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
                    if(path.classList.contains("syntax--hyperlink") > 0) {
                        isNormalHyperlink = true;
                        element = path;
                        break;
                    }
                    else if(isMarkdown && path.classList.contains("syntax--link") > 0) {
                        var child = path.querySelector(".syntax--link");

                        /*
                        * Markdown links can have the following structure
                        * [name](url) both the whole construct as well as the url
                        * (with the parentheses) have the link class
                        * If the clicked element with the link class has a child
                        * that has also the link class, we have clicked somewhere
                        * around "[name]" but since we search for a child with the
                        * link class, element will always be the element containing
                        * "(url)"
                        */
                        element = child? child : path;

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
                        * We match only the url inside the parentheses
                        */
                        var exp = /^\((.*)\)$/;
                        var matches = exp.exec(linkRaw);
                        if(matches && matches[1]) {
                            linkRaw = matches[1];
                        }
                        else {
                            /*
                            * We could also be clicking on a url reference of the
                            * form [name][refname]
                            * Now linkRaw would be "[refname]" if this is the cases
                            * we do not want to open anything
                            */

                            exp = /^(\[.*\])$/;
                            matches = exp.exec(linkRaw);

                            if(matches && matches[1]) {
                                return;
                            }
                        }

                        /*
                        * If the url could not be matched, we clicked on a link
                        * definition of the form [name]: url and only "url" was
                        * matched, so we don't need to do anything
                        */
                    }

                    var link = decodeURI(linkRaw);
                    console.log("Opening " + link + " in browser!");
                    shell.openExternal(link);
                }
            }
        });
    }
};
