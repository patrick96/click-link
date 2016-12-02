'use babel';

var shell = require("electron").shell;
var OnigRegExp = require('oniguruma').OnigRegExp;

import {
    CompositeDisposable
} from 'atom';
export default {
    activate(state) {
        this.subscriptions = new CompositeDisposable();
        document.querySelector("atom-pane-container.panes").addEventListener("click", function(e) {
            var isMarkdown = atom.workspace.getActiveTextEditor().getGrammar().scopeName == "source.gfm"

            var element = null;

            /*
            * We search the list with parent nodes upwards until we find a link element
            * This is an element with class hyperlink or if we're in markdown an element
            * with class link
            */
            for(var i in e.path) {
                var path = e.path[i];
                if(path.classList != undefined && (path.classList.contains("hyperlink") > 0 || (isMarkdown && path.classList.contains("link") > 0))) {
                    element = path;
                    break;
                }
            }

            // requires https://atom.io/packages/language-hyperlink to highlight hyperlink
            if (element) {
                if (e.ctrlKey || e.metaKey) {
                    var editor = atom.workspace.getActiveTextEditor();
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
                    if(isMarkdown) {
                        /*
                        * This is the same regexp as used by the language-hyperlink package
                        */
                        var regexp = new OnigRegExp('(?x)( (https?|s?ftp|ftps|file|smb|afp|nfs|(x-)?man(-page)?|gopher|txmt|issue)://|mailto:)((?!(\\#[[:word:]]*\\#))(?:[-:@[:word:].,~%+_/?=&#;|!]))+(?<![-.,?:#;])');

                        var matches = regexp.searchSync(linkRaw);
                        if(matches) {
                            linkRaw = matches[0].match;
                        }
                        else {
                            console.error("Markdown link \"" + linkRaw + "\" cannot be parsed.");
                            return;
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
