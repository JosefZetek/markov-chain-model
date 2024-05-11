import { EdgeStyler } from "./EdgeStyler";

/**
 * Trida slouzi pro stylyzaci hran v rezimu s intenzitami (Mark. retezec se spoj. casem)
 */

export class EdgeStylerIntensity extends EdgeStyler {
     /**
     * Metoda nastavi styl (barvu, tloustku) hrane podle jeji hondnoty.
     */
    public updateEdgeStyle() {
        let highestValue: number = 0;
        this.cy.edges().forEach((edge) => {
            if (highestValue < Number(edge.data("value"))) {
                highestValue = Number(edge.data("value"));
            }

        });

        this.cy.edges().forEach((edge) => {
            let edgeStyle = this.getEdgeStyle(+edge.data("value") / highestValue, false, (Math.round(+edge.data("value") * 1000) / 1000) + "");
            edge.style(edgeStyle);
        });

    }
}