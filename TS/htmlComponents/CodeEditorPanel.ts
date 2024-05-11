import ace = require('ace-builds');
import "ace-builds/src-noconflict/mode-javascript";
import '../../CSS/sidePanel.css';
import "ace-builds/webpack-resolver";
import '../../CSS/sidePanel.css';
import { CodeEditor } from '../graphCodeEditor/CodeEditor';
/**
 * Metoda pro zobrazeni panelu s editorem
 */
export class CodeEditorPanel {
    private codeEditor: CodeEditor
    private aceCodeEditor: ace.Ace.Editor;
    constructor(codeEditor: CodeEditor, parentElement: HTMLElement) {
        this.codeEditor = codeEditor;
        this.addCodeEditorPanel(parentElement);
    }
    /**
     * Metoda pro skryti panelu
     *
     */
    public hidden(hidden: boolean) {
        document.getElementById("codeEditorPanel").hidden = hidden;
    }
    /**
     * Pridani panelu s editorem do postraniho panelu
     * @param parentElement
     */
    private addCodeEditorPanel(parentElement: HTMLElement) {
        let codeEditorPanel = require('../../HTML/codeEditor.html');
        parentElement.insertAdjacentHTML('beforeend', codeEditorPanel);
        this.addCodeEditor();
    }
    /**
     * Metoda pro pridani editoru z knihovny ace
     */
    private addCodeEditor() {

        this.aceCodeEditor = ace.edit("codeEditor", {
            maxLines: 50,
            minLines: 10,
        })

        let createButton = document.getElementById("codeEditorCreateBtn");
        createButton.addEventListener("click", e => this.createGraph(this.aceCodeEditor.getValue()));

        this.setMode(this.aceCodeEditor);
    }

    private createGraph(editorValue: string) {
        let codeEditorErrMsg = <HTMLSpanElement> document.getElementById("codeEditorErrMsg");
        codeEditorErrMsg.textContent = "";
        try {
            this.codeEditor.createGraph(editorValue);
        }
        catch (e) {
            console.log(e);
            codeEditorErrMsg.textContent = e;
        }
    }

    private setMode(codeEditor: ace.Ace.Editor) {
        let JavaScriptMode = ace.require("ace/mode/javascript").Mode;
        codeEditor.session.setMode(new JavaScriptMode());
    }

    public getCode(): string {
        return this.aceCodeEditor.getValue()
    }

    public setCode(code: string) {
        this.aceCodeEditor.setValue(code);
    }

    public getCodeEditor(): CodeEditor {
        return this.codeEditor;
    }


}