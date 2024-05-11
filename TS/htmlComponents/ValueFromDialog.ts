import cytoscape = require('cytoscape');
import { FormDialogActions } from '../actions/editorActions/FormDialogActions';
import '../../CSS/valueEditor.css';
/**
 * Trida pro zobrazeni dialogoveho okna pro zadani hodnoty
 */
export class ValueFormDialog {
    private formDivElement: HTMLDivElement;
    private valueInputElement: HTMLInputElement;
    private errorMsgDiv: HTMLDivElement;
    private formActions: FormDialogActions;
    private dialogName: string;
    constructor(EditorActions: FormDialogActions, editorName: string) {
        this.formActions = EditorActions;
        this.dialogName = editorName;
    }

    /**
     *
     * @param actualValue Metoda pro zobrazeni dialogu za uvedene pozici position
     * @param position pozice pro zobrazeni diallogu
     */
    public showValueForm(actualValue: string, position: cytoscape.Position) {

        this.formDivElement = <HTMLDivElement> document.createElement("DIV");
        this.formDivElement.setAttribute("class", "value-editor-popup");

        let dialogTitle = <HTMLHeadElement> document.createElement("H6");

        dialogTitle.appendChild(document.createTextNode(this.dialogName));
        dialogTitle.setAttribute("class", "editorTitle");
        this.formDivElement.appendChild(dialogTitle);


        let inputDiv = <HTMLDivElement> document.createElement("DIV");
        this.valueInputElement = <HTMLInputElement> document.createElement("INPUT");
        this.valueInputElement.setAttribute("type", "text");
        this.valueInputElement.setAttribute("value", actualValue);
        this.valueInputElement.setAttribute("class", "form-control");
        inputDiv.appendChild(this.valueInputElement);
        this.formDivElement.appendChild(inputDiv);

        this.errorMsgDiv = <HTMLDivElement> document.createElement("DIV");
        this.errorMsgDiv.hidden = true;
        this.errorMsgDiv.setAttribute("class", "errorMessage small");

        this.formDivElement.appendChild(this.errorMsgDiv);

        let buttonsDiv = <HTMLDivElement> document.createElement("DIV");
        let submitButton = <HTMLButtonElement> document.createElement("BUTTON");
        submitButton.appendChild(document.createTextNode("Submit"));
        submitButton.setAttribute('type', "button");
        submitButton.setAttribute('class', "btn btn-success editorButton");
        buttonsDiv.appendChild(submitButton);

        submitButton.addEventListener("click", e => {
            this.formActions.submitChange(this.valueInputElement.value);
        });

        let cancelButton = <HTMLButtonElement> document.createElement("BUTTON");
        cancelButton.appendChild(document.createTextNode("Cancel"));
        cancelButton.addEventListener("click", e => this.formActions.cancelChange());
        cancelButton.setAttribute('type', "button");
        cancelButton.setAttribute('class', "btn btn-danger editorButton");
        buttonsDiv.appendChild(cancelButton);

        this.formDivElement.appendChild(buttonsDiv);
        document.getElementById("body").appendChild(this.formDivElement);
        this.formDivElement.style.left = position.x + "px";
        this.formDivElement.style.top = position.y + "px";

        let overPanel = document.getElementById("overPanel");

        overPanel.hidden = false;
        overPanel.addEventListener("click", e => this.formActions.cancelChange());
    }

    public showErrorMsg(message: string) {
        this.errorMsgDiv.hidden = false;
        this.errorMsgDiv.textContent = message;
    }

    public removeFormDialog() {
        let overPanel = document.getElementById("overPanel");
        overPanel.hidden = true;
        this.formDivElement.remove();
    }

}
