import { ValueEditorActions } from "./ValueFormActions";
import { EdgeSingular } from "cytoscape";
import { GraphStyler } from "../../graphStyler/GraphStyler";


/**
 * Trida pro dialogove okno s formularem pro zadani intenzity prechodu hrane
 */

export class EdgeIntensityEditorActions extends ValueEditorActions {
    private DEFAULT_EDGE_VALUE = 1;
    constructor(cy: cytoscape.Core, graphStyler: GraphStyler) {
        super(cy, graphStyler, "Set edge value")
    }
    /**
     * Metoda vrati aktualni hodnotu existujici hrany nebo vrati vychozi hodnotu 1
     * @param edge editovana/nova hrana
     */
    protected getActualValue(edge: EdgeSingular): number {
        let value = edge.data("value");
        if (value === undefined) {
            return this.DEFAULT_EDGE_VALUE;
        } else {
            return +edge.data("value");
        }
    }


}