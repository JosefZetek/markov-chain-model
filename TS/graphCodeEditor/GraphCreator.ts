import cytoscape = require('cytoscape');
import { Transition } from './Transiotion';
/**
 * Trida se stara o vytvoreni grafu ze skriptu
 */
export class GraphCreator {
    private MAX_PROB_VALUE = 1;
    private cy: cytoscape.Core;
    private columnCount: number;
    private rowCount: number;
    private nodeOutgoingProbs: Map<string, number> = new Map();
    constructor(cy: cytoscape.Core) {
        this.cy = cy;
        this.columnCount = 0;
        this.rowCount = 0;
    }
    /**
     * Metoda pro pridani prechodu do platna. V pripade vyskytu chyby v prechodu dojde k vyhozeni vyjimky, ktera obsahuje zpravu o vznikle chybe
     * @param transitions pole s prechody
     * @param checkOutputProb validace hodnoty na pravdepodobnost
     */
    public createGraph(transitions: Transition[], checkOutputProb: boolean) {
        let originalElements = this.cy.elements();

        try {
            this.cy.elements().remove();
            this.addTransitions(transitions, checkOutputProb);
            this.updateLayout(this.cy, this.columnCount, this.rowCount);
        } catch (e) {
            this.cy.elements().remove();
            this.cy.add(originalElements);
            throw e;
        }

    }
    /**
     * Aktualizace layoutu (grid layout) s mrizkou o veliskoti rowCount a columnCount
     * @param cy instacnce coru knihovny Cytoscape
     * @param rowCount pocet radku
     * @param columnCount pocet sloupcu
     */
    private updateLayout(cy: cytoscape.Core, rowCount: number, columnCount: number) {
        cy.layout( {

            name: 'grid',
            fit: true, // whether to fit the viewport to the graph
            padding: 100, // padding used on fit
            boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
            avoidOverlapPadding: 100, // extra spacing around nodes when avoidOverlap: true
            nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
            condense: true, // uses all available space on false, uses minimal space on true
            rows: rowCount, // force num of rows in the grid
            cols: columnCount, // force num of columns in the grid
            position: (node: cytoscape.NodeSingular) => this.getPosition(node)
          }).run();
    }

    private getPosition(node: cytoscape.NodeSingular): any {
        let positionX = node.data("positionX");
        let positionY = node.data("positionY");

        return {row: positionX, positionY};
    }
    /**
     * Metoda pro pridani prechodu.
     * @param transitions pole s prechody
     * @param checkOutputProb validace hodnoty na pravdepodobnost
     */
    private addTransitions(transitions: Transition[], checkOutputProb: boolean) {
        transitions.forEach(transition => {
            let sourceNodeId = this.addNode(transition.source);
            let targetNodeId = this.addNode(transition.target);
            this.addEdge(sourceNodeId, targetNodeId, transition.value, checkOutputProb);
        })
    }
    /**
     * Metoda prida uzel na zadanou pozici v mrizce
     * @param position pozice noveho uzlu v mrizce
     */
    private addNode(position: number[]): string {
        let nodeId = position[0] + "x" + position[1];
        if ( this.cy.getElementById(nodeId).length == 0) { // POZN node jeste  neexistuje
            this.updateGridLayoutSize(position[0], position[1])
            let node = this.cy.add({data: {id: nodeId}});
            node.data("positionX", position[0]);
            node.data("positionY", position[1]);
        }
        return nodeId;
    }
    /**
     * Prepocet velikosti mrizky pro umistovani uzlu
     * @param columnNumber cislo sloupce
     * @param rowNumber cislo radku
     */
    private updateGridLayoutSize(columnNumber: number, rowNumber: number) {
        if (this.columnCount < columnNumber) {
            this.columnCount = columnNumber;
        }

        if (this.rowCount < rowNumber) {
            this.rowCount = rowNumber;
        }
    }
    /**
     *
     * @param nodeId Metoda pro kotrolu vstupni hodnoty u hrany. V pripade chybne zadane hodnoty, je vyhozena vyjimka se zpravou o chybe
     * @param value hodnota hrany
     */
    private addEdge(sourceId: string, targetId: string, value: number, checkOutputProb: boolean) {
        if (isNaN(Number(value))) {
            throw new Error('Edge value between node "' + sourceId + '" and "' + targetId + '" is not a number');
        }

        if (value <= 0) {
            throw new Error('Edge value between node "' + sourceId + '" and "' + targetId + '" must be higher then 0');
        }

        if (checkOutputProb) {
            this.checkPropValue(sourceId, value);
        }

        let edge = this.cy.add({data: {id: sourceId + 'o' + targetId, source: sourceId, target: targetId}});
        edge.data("value", value);
    }
    /**
     *
     * @param nodeId Metoda pro kotrolu vstupni hodnoty u hrany s pravdepodobnosti. V pripade chybne zadane hodnoty, je vyhozena vyjimka se zpravou o chybe
     * @param value hodnota hrany
     */
    private checkPropValue(nodeId: string, value: number): boolean {

        if (this.nodeOutgoingProbs.has(nodeId)) {
            value = this.nodeOutgoingProbs.get(nodeId) + value;
        }

        if (value > 1) {
            throw new Error('Output probability for node on the position "' + nodeId + '" is higher then ' + this.MAX_PROB_VALUE);
        } else {
            this.nodeOutgoingProbs.set(nodeId, value);
            return true;
        }
    }
}
