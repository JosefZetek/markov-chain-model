import { ValueEditorActions as ValueFormActions } from "./ValueFormActions";
import { GraphStyler } from "../../graphStyler/GraphStyler";

/**
 * Trida pro dialogove okno s formularem pro zadani pradepodobnosi prechodu hrane
 */

export class EdgeProbFormActions extends ValueFormActions {
    private readonly MAX_VALUE_LENGTH: number = 3;
    private maxProbabilityValue: number;

    constructor(cy: cytoscape.Core, graphStyler: GraphStyler) {
        super(cy, graphStyler, "Set edge value")
    }
    /**
     * Metoda pro validaci vstupni hodnoty(hodnota nesmi byt vetsi v souctu s ostatnimi vystupnimi hranami vetsi nez 1
     *  V pripade, ze hodnota nesplnuje kriteria, je vracena chybova hlaska.
     * @param value retezec k validaci
     */
    protected checkInputValue(value: string): string {
        let resultAlertMsg = super.checkInputValue(value);
        if (resultAlertMsg === null) {
            if (this.maxProbabilityValue === 0) {
                return "Output probability for state must be equal to or less than 1."
            }
            if (+value > this.maxProbabilityValue) {
                return "Output probability for state must be equal to or less than 1 (Max acceptable value: " + this.maxProbabilityValue + ")";
            } else if (value.split(".")[1] !== undefined && value.split(".")[1].length > this.MAX_VALUE_LENGTH) {
                return "Max decimal places: " + this.MAX_VALUE_LENGTH;
            }
        }

        return resultAlertMsg;

    }
    /**
     * Metoda vrati aktualni hodnotu hrany. Pokud se vytvari nova hrana, vrati nejvetsi moznou hondnotu
     * @param edge
     */
    protected getActualValue(edge: cytoscape.EdgeSingular): number {
        this.maxProbabilityValue = 1;
        edge.source().outgoers().edges().forEach(edgeTmp => {
            if (edgeTmp.source() !== edgeTmp.target() && edge.target() !== edgeTmp.target()) { // bez hrany do uzlu a hrany, ktera se pridava
                this.maxProbabilityValue -= Math.round(+edgeTmp.data("value") * 1000) / 1000;
            }
        });
        this.maxProbabilityValue = Math.round(this.maxProbabilityValue * 1000) / 1000;
        if (edge.data("value") == null) { // nova hrana
            return this.maxProbabilityValue;
        } else {
            return Math.round(+edge.data("value") * 1000) / 1000;
        }
    }


}