import cytoscape = require('cytoscape');
import { ValueFormDialog } from '../../htmlComponents/ValueFromDialog';
import { GraphStyler } from '../../graphStyler/GraphStyler';
import { FormDialogActions } from './FormDialogActions';
/**
 * abstraktni trida pro dialogove okno s formularem pro zadani ciselne hodnoty
 */
export abstract class ValueEditorActions extends FormDialogActions {
    private actualEdge: cytoscape.EdgeSingular;
    private graphStyler: GraphStyler;

    protected abstract getActualValue(edge: cytoscape.EdgeSingular): number;

    constructor(cy: cytoscape.Core, graphStyler: GraphStyler, dialogName: string) {
        super(cy, null, dialogName);
        this.graphStyler = graphStyler;
        this.onSubmitAction = this.changeEdgeValue;
    }


    /**
     * Metoda pro validaci vstupni hodnoty(hodnota musi cislo vetsi nez 0). V pripade, ze hodnota nesplnuje kriteria, je vracena chybova hlaska.
     * @param value retezec k validaci
     */
    protected checkInputValue(value: string): string {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            return "Value must be number (> 0.0).";
        } else {
            return null;
        }
    }
    /**
     * Zobrazeni dialogoveho okna pro zadani hodnoty hrany
     * @param edge
     * @param position
     */
    public showEdgeValueForm(edge: cytoscape.EdgeSingular, position: cytoscape.Position) {
        this.actualEdge = edge;
        let actualValue = this.getActualValue(edge) + "";
        super.showDialog(actualValue, position);
    }

    /**
     * metoda pro zmenu hodnoty u hrany
     */
    private changeEdgeValue() {
        let value = this.getValue();
        this.actualEdge.data("value", value);
        this.actualEdge.style("label", value);
        this.graphStyler.updateEdgeColors();
    }
    /**
     * Zavreni dialogoveho okna bez zmeny. Smazani nove hrany.
     */
    public cancelChange() {
        if (this.actualEdge.data("value") == null) { // nebyla nastavena hodnota a hrana pred tim neexistovala
            this.cy.remove(this.actualEdge);
        }
        this.closeDialog();
    }
    /**
     * uzavreni dialogoveho okna
     */
    protected closeDialog() {
        this.actualEdge.target().unselect();
        super.closeDialog();
    }

}