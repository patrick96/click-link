'use babel';

shell = require("electron").shell;

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
                    var link = decodeURI(e.path[0].innerText);
                    console.log("Opening " + link + " in browser!");
                    shell.openExternal(link);
                }
            }
        });
    }
};
