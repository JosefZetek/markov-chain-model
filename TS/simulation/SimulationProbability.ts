import {Simulation} from "./Simulation";

/**
 * Tirda pro simulaci Mark. retezce s diskretnim casem
 */
export class SimulationProbability extends Simulation {


    public getNextEdge(actualNode: cytoscape.NodeSingular): cytoscape.EdgeSingular {

        const edges = actualNode.outgoers().edges();
        let randomNumber = Math.random();
        let probabilitySum: number = 0;
        for (let i = 0; i < edges.length; i++) {
            probabilitySum += +edges[i].data("value");
            if (randomNumber <= probabilitySum) {
                this.increaseNodeVisitFreq(actualNode.id(), 1);
                return edges[i];
            }
        }
        return null;
    }


}