'use babel';

import ClickLinkView from './click-link-view';
import { CompositeDisposable } from 'atom';

export default {

  clickLinkView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.clickLinkView = new ClickLinkView(state.clickLinkViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.clickLinkView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'click-link:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.clickLinkView.destroy();
  },

  serialize() {
    return {
      clickLinkViewState: this.clickLinkView.serialize()
    };
  },

  toggle() {
    console.log('ClickLink was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }
// requires https://atom.io/packages/language-hyperlink to highlight hyperlink
// shell = require("electron").shell;
// $('atom-text-editor::shadow .hyperlink').onclick=function(e) {
// alert(e.ctrlKey);
// if(e.ctrlKey) {
// alert(this.innerHTML);
// shell.openExternal(this.innerHTML);
// }
// };

// OR
// document.addEventListener("click", function(e) {
// if(e.path[0].classList.contains("hyperlink") > 0) {
// if(e.ctrlKey) {
// shell.openExternal(e.path[0].innerHTML);
// }
// }
// });

};
