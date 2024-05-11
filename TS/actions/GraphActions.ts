import cytoscape = require('cytoscape');
import {ValueEditorActions} from './editorActions/ValueFormActions';
import {EdgeIntensityEditorActions} from './editorActions/EdgeIntensityFormActions';
import {AnimationActions} from './AnimationActions';

/**
 * Vyctovy typ pro nastaveni modu pro modifikace grafu
 */
export enum ActionMode {
    Select,
    Add,
    Delete,
}
/**
 * Trida se stara o zpracovani akci tykajicich se grafu(pridavani, editace, mazani)
 */
export class GraphActions {

    private cy: cytoscape.Core;
    private actualActionMode: ActionMode;
    private sourceNodeId: string;
    private animationActions: AnimationActions;
    private valueEditorActions: ValueEditorActions;
    private nextNodeId: number;
    private lastClick: cytoscape.EventObject;
    private penultimateClick: cytoscape.EventObject;

    constructor(cy: cytoscape.Core, animationActions: AnimationActions) {
        this.cy = cy;
        this.actualActionMode = ActionMode.Select;
        this.animationActions = animationActions;
        this.sourceNodeId = null;
        this.valueEditorActions = new EdgeIntensityEditorActions(this.cy, this.animationActions.getStyler());
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.registerOnClickListener();
        this.nextNodeId = 0;
    }
    /**
     * registrace posluchace na kliknu a vyber v platne
     */
    private registerOnClickListener() {
        let doubleClickDelayMs = 350;
        let previousTapStamp: number;

        this.cy.addListener("click boxselect", event => {
            let currentTapStamp = event.timeStamp;
            let msFromLastTap = currentTapStamp - previousTapStamp;
            let isDoubleClick: boolean = msFromLastTap < doubleClickDelayMs;
            previousTapStamp = currentTapStamp;
            this.serviceClickAction(event, isDoubleClick);
        });
    }
    /**
     * Metoda pro oblsuhu kliknuti do platna
     * @param event udalost pri kliknuti
     * @param isDoubleClick priznak pro dovjklik
     */
    private serviceClickAction(event: cytoscape.EventObject, isDoubleClick: boolean) {
        this.penultimateClick = this.lastClick;
        this.lastClick = event;
        switch (this.actualActionMode) {
            case ActionMode.Add: {
               this.addElement(event);
               this.animationActions.getStyler().updateEdgeColors();
               break;
            }
            case ActionMode.Delete: {
               this.removeElement(event);
               this.animationActions.getStyler().updateEdgeColors();
               break;
            }
            case ActionMode.Select: {
                if (isDoubleClick && event.type !== "boxselect") {
                    this.processSelectDoubleClick(event);
                }
                break;
            }
         }
    }

    /**
     * Obsluha eventů pro stlačení klávesy
     */
    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'a' && this.cy.$(':selected').length === 2) {
            this.addEdgeBetweenLastTwo()
        } else if (event.ctrlKey && event.key === 'a') {
            this.addCenteredNode();
            event.preventDefault();
        } else if (event.key === 'Delete') {
            this.cy.$(':selected').remove();
        }
    }

    /**
     * Přidá uzel doporostřed plátna
     */
    public addCenteredNode() {
        const currentPan = this.cy.pan();
        const currentZoom = this.cy.zoom();

        const centerX = (this.cy.width() / 2 - currentPan.x) / currentZoom;
        const centerY = (this.cy.height() / 2 - currentPan.y) / currentZoom;

        let node = this.cy.add({ data: { id: this.nextNodeId + ""}});
        node.style("label", "0");
        this.nextNodeId++;

        node.position({ x: centerX, y: centerY });
    }

    /**
     * Metoda pro zpravocovani dvojkliku na platno
     * @param event udalost pri kliknuti
     */
    private processSelectDoubleClick(event: cytoscape.EventObject) {
        let clickTarget = event.target;
        if (clickTarget !== this.cy) {
            if ((<cytoscape.Singular>clickTarget).isNode()) {
                this.changeStartingNode(event);
            } else {
                this.changeEdgeValue(event);
            }
        }
    }
    /**
     * Metoda pro zmenu modu pri kliknuti do platna
     * @param actionMode novy mod
     */
    public setActionMode(actionMode: ActionMode): any {
        this.actualActionMode = actionMode;
    }
    /**
     * Metoda pro zmenu pocatecniho uzlu pro animaci
     * @param event udalost pri kliknuti
     */
    public changeStartingNode(event: cytoscape.EventObject) {
        this.animationActions.changeStartingNode( event.target);
    }

    /**
     * Metoda pro pridani elementu
     * @param event udalost pri kliknuti
     */
    private addElement(event: cytoscape.EventObject) {
        let clickTarget = event.target;
        if (clickTarget === this.cy) {
            if (this.sourceNodeId == null) {
                this.addNode(event);
            } else { // INFO je vybran uzel pro novou hranu, proto se musi deselectnout
                this.sourceNodeId = null;
            }
        } else if ((<cytoscape.Singular>clickTarget).isNode()) {
            if (this.sourceNodeId == null) {
                this.sourceNodeId = clickTarget.id();
            } else {
                this.addEdge(event);
            }
        }
    }
    /**
     * Metoda pro pridani uzlu
     * @param event udalost pri kliknuti
     */
    public addNode(event: cytoscape.EventObject) {
        let node = this.cy.add({ data: { id: this.nextNodeId + ""}});
        node.style("label", "0");
        this.nextNodeId++;

        node.position(event.position);
    }

    /**
     * Přidá hranu mezi poslední dva nakliknuté uzly
     */
    public addEdgeBetweenLastTwo() {
        let targetNodeId = this.lastClick.target.id();
        let sourceNodeId = this.penultimateClick.target.id();
        let sourceNode = this.cy.getElementById(sourceNodeId);
        let nodesAreConnected = sourceNode.edgesTo(this.lastClick.target);

        if (sourceNodeId !== targetNodeId && nodesAreConnected.length === 0) {
            let edge = this.cy.add({data: this.getEdgeDataDef(sourceNodeId, targetNodeId), style: {width: 5, lineColor: "red", targetArrowColor: "red"}});
            this.showEdgeValueEditor(this.lastClick, edge)
        }
    }

    /**
     * Metoda pro pridani hrany
     * @param event udalost pri kliknuti
     */
    public addEdge(event: cytoscape.EventObject) {
        let targetNodeId = event.target.id();
        let sourceNode = this.cy.getElementById(this.sourceNodeId);
        let nodesAreConnected = sourceNode.edgesTo(event.target);

        if (this.sourceNodeId !== targetNodeId && nodesAreConnected.length === 0) {
            let edge = this.cy.add({data: this.getEdgeDataDef(this.sourceNodeId, targetNodeId), style: {width: 5, lineColor: "red", targetArrowColor: "red"}});
            this.showEdgeValueEditor(event, edge)
        } else {
            this.sourceNodeId = targetNodeId; // INFO prenastaveni uzlu pri klinuti
        }
    }
    /**
     * Metoda vrati definici pro novou hranu
     * @param sourceNodeId pocatecni uzel
     * @param targerNodeId cilovy uzel
     */
    private getEdgeDataDef(sourceNodeId: string, targerNodeId: string): cytoscape.EdgeDataDefinition {
        return {id: sourceNodeId + 'o' + targerNodeId, source: sourceNodeId, target: targerNodeId}
    }
    /**
     * Metoda provede zmenu hodnoty u hrany. Zobrazi editacni formular
     * @param event udalost pri kliknuti
     */
    public changeEdgeValue(event: cytoscape.EventObject) {
        const edge = event.target;
        this.showEdgeValueEditor(event, edge);

    }
    /**
     * Metoda pro zobrazeni formulare k editaci hodnoty hrany
     * @param event akce pri kliknuti
     * @param edge vybrana hrana
     */
    private showEdgeValueEditor(event: cytoscape.EventObject, edge: cytoscape.EdgeSingular) {
        let position = event.renderedPosition;
        this.sourceNodeId = null; // zruseni vybraneho uzlu
        this.valueEditorActions.showEdgeValueForm(edge, position);
    }

    /**
     * Smazani vybraneho elementu
     * @param event udalost pri kliknuti
     */
    public removeElement(event: cytoscape.EventObject) {
        if (event.target !== this.cy) {
            this.cy.remove(event.target);
        }
    }
    /**
     * Metoda smaze vybrane elementy
     * @param event udalost pri kliknuti
     */
    public removeSelectedElements(event: cytoscape.EventObject) {
        this.cy.$(':selected').remove();
    }
    /**
     * Metoda pro zmenu dialogu pro zadavani hodnot (pradepdobnosti, intenzity)
     * @param valueEditorActions trida s rodicem ValueEditorActions
     */
    public changeValueEditor(valueEditorActions: ValueEditorActions) {
        this.valueEditorActions = valueEditorActions;
    }
    /**
     * Metoda provede prepocet hodnot hran z intenzit na pravdepodobnosti
     */
    public changeToProbability() {

        let nodes = this.cy.nodes();
        nodes.forEach(node => {
            let outgoers = node.outgoers().edges();
            let sum: number = 0;
            outgoers.forEach(edge => {
                sum += +edge.data("value");
            });

            outgoers.forEach(edge => {
                let value: number = +edge.data("value");
                edge.data("value",  Math.round((value / sum) * 1000) / 1000);
            });
        });
    }
    /**
     * Metoda provede prepocet hodnot hran z pravdepodobnosti na intenzity
     */
    public changeToIntesity() {
        let nodes = this.cy.nodes();
        nodes.forEach(node => {
            let outgoers = node.outgoers().edges();

            outgoers.forEach(edge => {
                if (edge.target() === node) {
                    edge.data("value", 0);
                }
            });
        });
    }

}