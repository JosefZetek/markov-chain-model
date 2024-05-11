import cytoscape = require('cytoscape');

/**Declaration of JSMatrix from js lib Matrix.js */
declare var JSMatrix: any;
/**
 * Trida se stara o vypocet analytickeho reseni
 */
export class AnalyticalSolution {
    private cy: cytoscape.Core;
    constructor(cy: cytoscape.Core) {
        this.cy = cy;
    }
    /**
     * Metoda v prvni rade zjisti, zda je graf silne souvisly. Pokud je, provede se vypocet analytickeho reseni a vysledek je vracen jako
     * pole cisel
     * V opacnem pripade se vracena hodnota null
     */
    public resolve(): any {
        if (this.isGraphStrongConnected()) {
            let graphMatrix = this.createLinEquationMatrix();
            this.modifyLastMatrixRow(graphMatrix);

            let matrix = JSMatrix.mat(graphMatrix);
            let vector = JSMatrix.vec(this.createColumnVector(graphMatrix.length));
            return matrix.gaussianElimination(vector);

        } else {
            return null;
        }

    }
    /**
     * Metoda vytvori pole o veliskosti vectorSize s hodnotami 0 a v posledni polozce bude hodnota 1
     * @param vectorSize velikost vektoru
     */
    private createColumnVector(vectorSize: number) {
        let vector: number[] = [];

        for (let i = 0; i < vectorSize; i++) {
            vector.push(0);
        }
        vector[vectorSize - 1] = 1;
        return vector;
    }
    /**
     * Metoda upravi posledni radek matice pro nalezeni stac. rozdeleni
     * @param incMatrix matice pro stac. rozdeleni
     */
    private modifyLastMatrixRow(incMatrix: number[][]) {
        for (let i = 0; i < incMatrix.length; i++) {
            incMatrix[incMatrix.length - 1][i] = 1;
        }
    }
    /**
     * Metoda vytvori matici predstavuji soustvau linearnich rovnich pro zjisteni stacionarniho rozdeleni. Tato matice je
     * vracena
     */
    private createLinEquationMatrix(): number[][] {
        let nodes = this.cy.elements().nodes();
        let nodesSize = nodes.size();

        let nodeIds: Array<string> = new Array(); // Pole je vytvorene kvuli tomu, aby se zjistilo poradi nodu v nodes

        nodes.forEach(node => {
            nodeIds.push(node.id());
        });

        let incMatrix: number[][] = this.initTransitionMatrix(nodesSize);

        nodes.forEach(node => {
            let sourceIndex = nodeIds.indexOf(node.id());
            let outgoersEdges: cytoscape.EdgeCollection = node.outgoers().edges();

            outgoersEdges.forEach(edge => {
                incMatrix[sourceIndex][sourceIndex] -= edge.data("value");
            });

            let incomersEdges: cytoscape.EdgeCollection = node.incomers().edges();

            incomersEdges.forEach(edge => {
                let targetId = edge.source().id();
                let targetIndex = nodeIds.indexOf(targetId);
                incMatrix[sourceIndex][targetIndex] += +edge.data("value");
            });
        });

        return incMatrix;
    }
    /**
     * Metoda provede inicializaci prazdne matice o veliskosti nodeSize - hodnoty jsou 0
     * @param nodesSize Velikost matice
     */
    private initTransitionMatrix(nodesSize: number) {
        let incMatrix: number[][] = []; // inicializace matice
        for (let i: number = 0; i < nodesSize; i++) {
            incMatrix[i] = [];
            for (let j: number = 0; j < nodesSize; j++) {
                incMatrix[i][j] = 0;
            }
        }
        return incMatrix;
    }
    /**
     * Metoda zjisiti, zda je graf silne souvisly. Pokud je, vrati true, jinak vrati false
     */

    private isGraphStrongConnected(): boolean {

        let isVisitAllNodes = this.isDFSVisitAll();
        if (isVisitAllNodes) {
            this.revertEdges();
            isVisitAllNodes = this.isDFSVisitAll();
            this.revertEdges();
        }

        return isVisitAllNodes;
    }
    /**
     * Metoda provede prevraceni smeru hran pro cely graf
     */
    private revertEdges() {
        let edgesCopy = this.cy.elements().edges().copy();
        edgesCopy.forEach(edge => {
                let source = edge.data("source");
                let target = edge.data("target");
                let origEdge = this.cy.elements().edges().getElementById(edge.id());
                origEdge.move({source: target, target: source});
        })

    }
    /**
     * Metoda zjisti, zda se pri algoritmu dfs navstivi vsechny uzly grafu.
     * Pokud ano, vrati true, jinak vrati false
     */
    private isDFSVisitAll(): boolean {
        let nodeCount = 0;
        this.cy.elements().depthFirstSearch({
            roots: this.cy.elements().nodes()[0],
            visit: function(v, e, u, i, depth) {
                nodeCount++;
            },
            directed: true
        });

        return this.cy.elements().nodes().size() === nodeCount;
    }



}