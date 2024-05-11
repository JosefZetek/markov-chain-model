import cytoscape = require('cytoscape');
import {indexOf} from "lodash";

/**
 * Trida slouzi pro simulaci a udrzeni stavu simulace
 */
export abstract class Simulation {
    protected cy: cytoscape.Core;
    private allVisits: number = 0;
    private nodeVisitFrequencies = new Map<string, number>();
    private nodePath: string[];
    private currentProbabilities: number[];
    private visitedNodesCount: number = 0;
    private isIterationRun: boolean = false;

    constructor(cy: cytoscape.Core) {
        this.cy = cy;
        this.nodePath = [];
    }

    /**
     * Metoda pro zjisteni dalsi hrany v simulaci. Hrana je pak vracena
     * @param actualNode vychozi uzel hrany
     */
    abstract getNextEdge(actualNode: cytoscape.NodeSingular): cytoscape.EdgeSingular;

    /**
     * Metoda zvysi frekvenci navstiveni pro uzel s danym id o urcitou hodnotu increment a provede aktualizaci historie
     * @param nodeId navstiveny uzel
     * @param increment pridavana hodnota
     */
    public increaseNodeVisitFreq(nodeId: string, increment: number) {
        this.nodePath.push(nodeId);
        this.increaseFreqs(nodeId, increment);
        this.updateHistory();

    }

    /**
     * Metoda zvysi frekvenci navstiveni pro uzel s danym id o urcitou hodnotu increment
     * @param nodeId navstiveny uzel
     * @param increment pridavana hodnota
     */
    private increaseFreqs(nodeId: string, increment: number) {
        let prevFreq = this.nodeVisitFrequencies.get(nodeId);
        if (prevFreq == null) {
            this.nodeVisitFrequencies.set(nodeId, increment);
        } else {
            this.nodeVisitFrequencies.set(nodeId, prevFreq + increment);
        }
        this.allVisits += increment;
        this.visitedNodesCount += 1;
    }

    /**
     * Metoda provede aktualizaci historie u kazdeho uzlu. Prida novou hodnotu aktualni pravdepodobnosti navstiveni
     */
    private updateHistory() {

        // aktuální pravděpodobnosti pro všechny uzly.
        let currentProbabilities = this.getCurrentNodeVisitProbabilities();
        // časový krok pro numerické řešení.
        let dt = 0.01;
        let startNodeId = this.nodePath[this.nodePath.length - 1];
        this.computeNumericalSolution(startNodeId, dt);

        this.cy.nodes().forEach((node, index) => {

            let derHistory = <number[]>node.data("derHistory");
            let history = <number[]>node.data("history");

            if (history == null || derHistory == null) {
                history = [];
                derHistory = [];
            }

            if (this.nodeVisitFrequencies.has(node.id()) && !this.isIterationRun) {
                let value = this.nodeVisitFrequencies.get(node.id());
                history.push(value / this.allVisits);
            } else {
                history.push(0);
            }
            node.data("derHistory", derHistory);
            node.data("history", history);
        });
    }

    /**
     * Metoda slouzi pro nastaveni vychozich hodnot pro sber informaci a historie o simulaci
     * @param startNodeId
     */
    public resetSimulation(startNodeId: string) {
        this.allVisits = 0;
        this.visitedNodesCount = 0;
        this.nodeVisitFrequencies.clear();
        this.nodePath = [];
        this.cy.nodes().forEach(node => {

            let histories: number[] = [];
            let derHistories: number[] = [];
            node.data("history", histories);
            node.data("derHistory", derHistories);
        });

        this.currentProbabilities = null;
        this.isIterationRun = false;
        this.increaseNodeVisitFreq(startNodeId, 1);
    }

    public clearSimulationHistoryOnNodes(): void{
        this.cy.nodes().forEach(node => {
            let arrayFilledWithZeros: number[] = node.data("history").fill(0);
            node.data("history", arrayFilledWithZeros);
        });
    }

    public resetIteration(startNodeId: string, areIterationsCompleted: boolean) {
        if (!this.isIterationRun){
            //Clear simulation data when first iteration occurs
            this.clearSimulationHistoryOnNodes();
        }
        this.isIterationRun = true;

        if (!areIterationsCompleted){
            this.increaseNodeVisitFreq(startNodeId, 1);
        }
    }

    /**
     * metoda zjisiti pravdepodobnost navstivneni uzlu
     */
    public getNodeVisitProbability(showDifferential?: boolean): Map<string, number> {
        if (showDifferential) {
            return this.getDifferentialNodeVisitProbability();
        }

        let nodeVisitProbability: Map<string, number> = new Map();
        this.nodeVisitFrequencies.forEach((value: number, key: string) => {
            nodeVisitProbability.set(key, value / this.allVisits);
        });
        return nodeVisitProbability;
    }

    private getDifferentialNodeVisitProbability(): Map<string, number> {
        let nodeVisitProbability: Map<string, number> = new Map();

        //Display current differential probability used in the iteration run
        let nodes = this.cy.nodes();
        let nodeIds = nodes.map(node => node.id());

        this.nodeVisitFrequencies.forEach((value: number, key: string) => {
            let probability = this.currentProbabilities[nodeIds.indexOf(key)];
            let displayedProbability = isNaN(probability) ? 0 : probability;
            nodeVisitProbability.set(key, displayedProbability);
        });

        //HF for displaying differential probability - on first visit calculations is 0.99 that does not look good since its default on reset
        if (this.visitedNodesCount <= 1 ){
            const sortedArray = Array.from(nodeVisitProbability.entries()).sort((a, b) => b[1] - a[1]);
            if (sortedArray.length >= 1){
                const [key, value] = sortedArray[0];
                nodeVisitProbability.clear()
                nodeVisitProbability.set(key, 1);
            }
            return nodeVisitProbability;
        }

        return nodeVisitProbability;
    }

    /**
     * metoda vraci navstivene uzly v ramci simulace
     */
    public getSimulationPath() {
        return this.nodePath;
    }

    /**
     * Metoda pro numerický výpočet hodnot uzlů v čase
     * @param startNodeId aktuální uzel
     * @param dt časový krok pro numerické řešení
     */
    public computeNumericalSolution(startNodeId: string, dt: number): void {
        let P = this.createTransitionProbabilityMatrix(); // Matice přechodových pravděpodobností
        if (!this.currentProbabilities) {
            this.currentProbabilities = this.getCurrentNodeVisitProbabilities();
        }

        this.storeDerivatives(this.currentProbabilities, P, dt);
        this.currentProbabilities = this.rungeKuttaStep(this.currentProbabilities, this.computeDerivative(this.currentProbabilities, P), dt);
    }

    /**
     * Aktualizuje historii hodnot vypočtených numerickou derivací
     * @param x aktuální pravděpodobnosti
     * @param P matice přechodů
     * @param dt časový krok pro numerické řešení
     */
    private storeDerivatives(x: number[], P: number[][], dt: number): void {
        let dx = this.computeDerivative(x, P);
        let newX = this.rungeKuttaStep(x, dx, dt);

        this.cy.nodes().forEach((node, i) => {
            let derHistory = node.data("derHistory") || [];
            derHistory.push(newX[i]);
            node.data("derHistory", derHistory);
        });
    }

    /**
     * Metoda pro krok integrace Runge-Kutta čtvrtého řádu
     * @param x aktuální pravděpodobnosti
     * @param dx aktuální hodnoty derivací
     * @param dt šasový krok
     */
    private rungeKuttaStep(x: number[], dx: number[], dt: number): number[] {
        let k1 = this.computeDerivative(x, this.createTransitionProbabilityMatrix());
        let k2 = this.computeDerivative(x.map((xi, i) => xi + k1[i] * (dt / 2)), this.createTransitionProbabilityMatrix());
        let k3 = this.computeDerivative(x.map((xi, i) => xi + k2[i] * (dt / 2)), this.createTransitionProbabilityMatrix());
        let k4 = this.computeDerivative(x.map((xi, i) => xi + k3[i] * dt), this.createTransitionProbabilityMatrix());

        let newX = x.slice();
        for (let i = 0; i < x.length; i++) {
            newX[i] += (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * (dt / 6);
        }
        return newX;
    }

    /**
     * Metoda pro výpočet derivací
     * @param x aktuální pravděpodobnosti
     * @param P matice přechodů
     */
    private computeDerivative(x: number[], P: number[][]): number[] {
        let dx = new Array(P.length).fill(0);
        for (let i = 0; i < P.length; i++) {
            for (let j = 0; j < P.length; j++) {
                dx[i] += P[j][i] * x[j] - P[i][j] * x[i];
            }
        }
        return dx;
    }

    /**
     * Metoda pro vytvoření matice přechodů podle aktuálního stavu uzlů
     */
    private createTransitionProbabilityMatrix(): number[][] {
        let nodes = this.cy.nodes();
        let nodeIds = nodes.map(node => node.id());
        let nodeCount = nodes.size();
        let P: number[][] = Array.from({length: nodeCount}, () => Array(nodeCount).fill(0));
        nodes.forEach(sourceNode => {
            sourceNode.outgoers().edges().forEach(edge => {
                let targetNode = edge.target();
                let probability = edge.data("value");
                let sourceIndex = nodeIds.indexOf(sourceNode.id());
                let targetIndex = nodeIds.indexOf(targetNode.id());
                P[sourceIndex][targetIndex] = probability;
            });
        });

        return P;
    }

    /**
     * Získá aktuální pravděpodobnosti návštěvy uzlů na základě frekvence návštěvy.
     */
    private getCurrentNodeVisitProbabilities(): number[] {
        let nodes = this.cy.nodes();
        let nodeIds = nodes.map(node => node.id());
        let nodeCount = nodes.size();
        let probabilities = Array(nodeCount).fill(0);

        let totalVisits = this.allVisits;

        nodes.forEach(node => {
            let nodeId = node.id();
            let visitFrequency = this.nodeVisitFrequencies.get(nodeId) || 0;
            let nodeIndex = nodeIds.indexOf(nodeId);
            probabilities[nodeIndex] = visitFrequency / totalVisits;
        });

        return probabilities;
    }
}