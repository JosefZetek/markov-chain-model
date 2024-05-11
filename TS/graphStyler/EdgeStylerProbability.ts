import { GraphStyler } from "./GraphStyler";
import { EdgeStyler } from "./EdgeStyler";

/**
 * Trida slouzi pro stylyzaci hran v rezimu s pravdepodobnostmi(Mark. retezec s disk. casem)
 */

export class EdgeStylerProbability extends EdgeStyler {
    private readonly TO_DECIMAL_VALUE = 10000
    /**
     * Metoda nastavi styl(barvu, tloustku) podle hondnoty hrany. Dale se spocita zbyvajici pravdepodobnost u vystupnich hran a pri
     * zbbytku se zobrazi smycka u uzlu
     */
    public updateEdgeStyle() {
        this.cy.nodes().forEach((node) => {
            let probabilitySum = this.countProbSum(node);


            let reamingProbability = (this.TO_DECIMAL_VALUE - probabilitySum * this.TO_DECIMAL_VALUE) / this.TO_DECIMAL_VALUE;
            let nodeId = node.id();
            let edge = this.cy.elements('edge[target = "' + nodeId + '"][source = "' + nodeId + '"]');
            if (edge.length == 0) {
                edge = this.cy.add({data: {id: nodeId + 'o' + nodeId, source: nodeId, target: nodeId}});
            }

            let edgeStyle = this.getEdgeStyle(reamingProbability, true, (Math.round(reamingProbability * 1000) / 1000) + "");

            edge.data("value", Math.round(reamingProbability * 1000) / 1000);
            edge.style(edgeStyle);

        });
    }
    /**
     * Vypocet sumy pravdepodobnosti vystupnich hran ze stavu node
     * @param node uzel
     */
    private countProbSum(node: cytoscape.NodeSingular): number {
        let probabilitySum = 0;
        let outgoers = node.outgoers().edges();
        outgoers.forEach((edge) => {
            if (edge.source() !== edge.target()) {
                if (edge.data("value") != undefined) {
                    let probability: number = +edge.data("value");
                    let edgeStyle = this.getEdgeStyle(probability, false, Math.round(probability * 1000) / 1000 + "");
                    edge.style(edgeStyle);
                    probabilitySum += probability;
                }

            }

        });
        return probabilitySum;
    }
}