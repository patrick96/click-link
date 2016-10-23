'use babel';

var shell = require("electron").shell;

import {
    CompositeDisposable
} from 'atom';
export default {
    activate(state) {
        this.subscriptions = new CompositeDisposable();
        document.querySelector("atom-pane-container.panes").addEventListener("click", function(e) {
            // requires https://atom.io/packages/language-hyperlink to highlight hyperlink
            if (e.path[0].classList.contains("hyperlink") > 0) {
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
                        var cursor = editor.getCursorAtScreenPosition(screenPos).destroy();    
                    }
                    var link = decodeURI(e.path[0].innerText);
                    console.log("Opening " + link + " in browser!");
                    shell.openExternal(link);
                }
            }
        });
    }
};
