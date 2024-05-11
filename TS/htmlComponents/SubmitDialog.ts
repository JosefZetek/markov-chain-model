/**
 * Trida pro zobrazeni potvrzovaciho formulare pri prepnuti mezi modely
 */
export class SubmitDialog {
    private message: string;
    private label: string;
    private onSubmitAction: () => void;
    private onCancelAction: () => void;
    /**
     *
     * @param label nazev dialogu
     * @param message zprava v dialogu
     * @param onSubmitAction funce, ktera se vykona pri potvrzeni okna
     * @param onCancelAction  funkce, ktera se vykona pri uzavrneni okna
     */
    constructor(label: string, message: string, onSubmitAction: () => void, onCancelAction: () => void) {
        this.message = message;
        this.label = label;
        this.onSubmitAction = onSubmitAction;
        this.onCancelAction = onCancelAction;

    }

    public showDialog() {
        let html = require('../../HTML/submitDialog.html');
        document.getElementById("body").insertAdjacentHTML('afterbegin', html);
        let showDialogButton = <HTMLButtonElement> document.getElementById("dialogButton");
        let cancelButton = <HTMLButtonElement> document.getElementById("dialogCancelButton");
        let submitButton = <HTMLButtonElement> document.getElementById("dialogSubmitButton");
        let text = document.getElementById("submitDialogText");
        let labelDialog = document.getElementById("sumbitModalLabel");
        labelDialog.textContent = this.label;
        text.textContent = this.message;
        submitButton.addEventListener("click", this.onSubmitAction);
        cancelButton.addEventListener("click", e => {
            this.onCancelAction();
            showDialogButton.remove();
        });
        showDialogButton.click();
    }


}