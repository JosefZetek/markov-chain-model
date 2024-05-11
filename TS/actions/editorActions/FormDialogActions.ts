import cytoscape = require('cytoscape');
import { ValueFormDialog } from '../../htmlComponents/ValueFromDialog';
/**
 * Trida pro zakladni dialogove okno s formularem pro zadani textu
 */
export class FormDialogActions {
    protected cy: cytoscape.Core;
    protected valueFormDialog: ValueFormDialog;
    protected onSubmitAction: () => void;
    private formValue: string;
    private dialogName: string
    /**
     *
     * @param cy instance coru knihovny Cytoscape
     * @param onSubmitAction funce volana pri potvrzeni dialogoveho okna
     * @param dialogName nazen okna
     */
    constructor(cy: cytoscape.Core, onSubmitAction: () => void, dialogName: string) {
        this.cy = cy;
        this.onSubmitAction = onSubmitAction;
        this.dialogName = dialogName;
    }


    /**
     * Metoda pro validaci vstupni hodnoty(hodnota musi byt neprazdny retezec). V pripade, ze hodnota nesplnuje kriteria, je vracena chybova hlaska.
     * @param value retezec k validaci
     */
    protected checkInputValue(value: string): string {
        if (value === null || value === "") {
            return "Value can not be empty.";
        } else {
            return null;
        }
    }
    /**
     * Zobrazeni dialogoveho okna
     * @param value hodnota ve formulari
     * @param position pozice okna
     */
    public showDialog(value: string, position: cytoscape.Position) {
        this.valueFormDialog = new ValueFormDialog(this, this.dialogName);
        position = this.recalculatePosition(position);
        this.valueFormDialog.showValueForm(value, position);
    }
    /**
     * Metoda pro potvrzeni zmeny
     * @param value
     */
    public submitChange(value: string) {
        let errorMsg = this.checkInputValue(value);
        if (errorMsg === null) {
            this.formValue = value;
            this.onSubmitAction();
            this.closeDialog();
        } else {
            this.valueFormDialog.showErrorMsg(errorMsg);
        }
    }
    /**
     * metoda pro zavreni okna
     */
    public cancelChange() {
        this.closeDialog();
    }
    /**
     * metoda pro zavreni okna
     */
    protected closeDialog() {
        this.valueFormDialog.removeFormDialog();
    }
    /**
     * Metoda vraci hodnotu vyplnenou ve formulari
     */
    public getValue() {
        return this.formValue;
    }
    /**
     * prepocitani pozice pro zobrazeni okna v platne
     * @param renderedPosition pozice pro renderovani v platne
     */
    private recalculatePosition(renderedPosition: cytoscape.Position): cytoscape.Position {
        let container = (<HTMLElement>this.cy.container());
        let x: number = container.offsetLeft + renderedPosition.x;
        let y: number = container.offsetTop + renderedPosition.y;
        return {x: x, y: y};
    }

}