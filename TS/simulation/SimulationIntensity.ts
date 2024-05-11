import { Simulation } from "./Simulation";
import cytoscape = require('cytoscape');


export class SimulationIntensity extends Simulation {

    public getNextEdge(actualNode: cytoscape.NodeSingular): cytoscape.EdgeSingular {

        const edges = actualNode.outgoers().edges();
        let randomNumber = Math.random();
        let intesitySum: number = 0;
        let probabilitySum: number = 0;

        for (let i = 0; i < edges.length; i++) {
            if (edges[i].source() !== edges[i].target()) {
                intesitySum += +edges[i].data("value");
            }
        }

        let time = this.getExpRandom(intesitySum);

        for (let i = 0; i < edges.length; i++) {
            if (edges[i].source() !== edges[i].target()) {
                probabilitySum += +edges[i].data("value") / intesitySum;
                if (randomNumber <= probabilitySum) {
                    this.increaseNodeVisitFreq(actualNode.id(), time);
                    return edges[i];
                }
            }
        }

        return null;
    }

    private getExpRandom(transitionRatesSum: number): number { // transitionRatesSum stredni hodnota
        let randomNumber = Math.random();
        return -Math.log(1 - randomNumber) / transitionRatesSum
    }
}