import cytoscape = require('cytoscape');

import '../../CSS/animatorPanel.css';
import {GraphStyler} from '../graphStyler/GraphStyler';
import {Simulation} from '../simulation/Simulation';
import {SimulationIntensity} from '../simulation/SimulationIntensity';
import {AlertMessage} from '../htmlComponents/AlertMessage';
import {NodeGroupsActions} from "./NodeGroupsActions";

function getMaxNumberOfIterations(): number {
    return Number((<HTMLInputElement>document.getElementById("iterations")).value);
}

function isShowDifferentialEnabled(): boolean{
    return (<HTMLInputElement>document.getElementById("switch")).checked;
}

function setCurrentIterationsValue(value: number){
    let element = document.getElementById("currentIteration");
    element.textContent = String(value);
}

function showDifferential(): void{
    let element = <HTMLInputElement>document.getElementById("switch");
    element.checked = true;
}

function setSwitchDisabled(disable: boolean){
    let element = <HTMLInputElement>document.getElementById("switch");
    element.disabled = disable;
}

/**
 * Trida se stara o akce ohledne simulace
 */

export class AnimationActions {

    private actualNode: cytoscape.NodeSingular;

    private actualAnimation: cytoscape.AnimationManipulation;

    private actualEdge: cytoscape.EdgeSingular;

    private animationSkipped: boolean;

    private animDuration: number = 1000;

    /**Musim si pamatovat, abych ji mohl odstranit (reverse) */
    private lastEdgeAnimation: cytoscape.AnimationManipulation;

    /**progres predchozi animace */
    private prevAnimProgress: number = 1.0;

    private cy: cytoscape.Core;

    private graphStyler: GraphStyler;

    private startAnimationNode: cytoscape.NodeSingular;

    private simulation: Simulation;

    private isAnimationFailed: boolean = false;

    private maxIterationsNumber: number = 1;

    private currentIterationNumber: number = 0;

    private absorbNode: cytoscape.NodeSingular;

    private nodeActions: NodeGroupsActions;

    constructor(cy: cytoscape.Core, graphStyler: GraphStyler, nodeActions: NodeGroupsActions) {
        this.cy = cy;
        this.nodeActions = nodeActions;
        this.simulation = new SimulationIntensity(this.cy);
        this.graphStyler = graphStyler;
        this.actualNode = cy.nodes()[0];
        this.startAnimationNode = cy.nodes()[0];
    }

    /**
     * Metoda pro zobrazeni/skryti ovladajiciho panelu
     */
    public enableControlPanel(enable: boolean) {
        let controlPanel = document.getElementById("animationPanel");
        controlPanel.hidden = !enable;
    }

    /**
     * Metoda pro resetovani animace a nastaveni vychoziho vzhledu grafu
     */
    public resetAnimation() {
        if (this.actualAnimation != null) {
            this.actualAnimation.pause();
        }

        this.absorbNode = null;
        this.graphStyler.setDefaultStyle();
        this.initAnimation();
        this.simulation.resetSimulation(this.startAnimationNode.id());
        this.currentIterationNumber = 0;
        setSwitchDisabled(false);
        setCurrentIterationsValue(this.currentIterationNumber);
    }


    public runNextIteration() {
        this.graphStyler.setDefaultStyle();
        this.initAnimation();
        this.runAnimation();
    }

    /**
     * Metoda pro zmenu typu simulace diskretni/spojity cas
     * @param simulation objekt s abstraktni tridou Simulation
     */
    public changeSimulation(simulation: Simulation) {
        this.simulation = simulation;
    }

    /**
     * Inicializace animace a nastaveni vychoziho vzhledu
     */
    private initAnimation() {
        this.prevAnimProgress = 1.0;

        this.actualAnimation = null;
        this.animationSkipped = false;
        this.actualEdge = null;
        let runButton = document.getElementById("runButton");
        runButton.textContent = "play";
        //nastaveni vychoziho uzlu pro animaci
        if (this.startAnimationNode == null) {
            this.actualNode = this.cy.nodes()[0];
            this.startAnimationNode = this.cy.nodes()[0];
        }


        if (this.startAnimationNode != null) {
            let nodeId = this.startAnimationNode.id();

            this.handleEndOfIteration(nodeId);

            if (this.cy.getElementById(nodeId).length == 0) {
                this.startAnimationNode = this.cy.nodes()[0];
            }
            this.actualNode = this.startAnimationNode;
        }

        this.updateNodes();
    }

    /**
     * Zmena vychoziho uzlu pro animaci
     * @param startingNode vychozi uzel pro animaci
     */
    public changeStartingNode(startingNode: cytoscape.NodeSingular) {
        this.startAnimationNode = startingNode;
        this.resetAnimation()
    }

    /**
     * Metoda pro spusteni/pozastaveni simulace
     */
    public runAnimation() {
        let prevAnimationSkipped = this.animationSkipped;
        this.animationSkipped = false;
        let runButton = document.getElementById("runButton");
        if (this.actualAnimation == null || prevAnimationSkipped) {
            this.runNodeAnimation(0);
            this.maxIterationsNumber = getMaxNumberOfIterations();
            runButton.textContent = "pause";
        } else if (this.actualAnimation.playing()) {
            runButton.textContent = "play";
            this.actualAnimation.pause();
        } else {
            runButton.textContent = "pause";
            this.actualAnimation.play();
        }
    }

    /**
     * Metoda vrati styler pro graf
     */
    public getStyler(): GraphStyler {
        return this.graphStyler;
    }

    /**
     * Metoda vykona skok v animaci o tolik kroku, kolik jich je zadano ve formulari u ovladaciho panelu
     */
    public highlightNextStep() {
        this.graphStyler.updateEdgeColors();
        let stepCount = this.getStepCount();
        let edge: cytoscape.EdgeSingular = null;
        let runButton = document.getElementById("runButton");
        let nextButton = <HTMLButtonElement>document.getElementById("nextButton");
        nextButton.disabled = true;
        runButton.textContent = "play";
        for (let i = 0; i < stepCount; i++) {
            edge = this.getNextEdge();
        }


        this.highlightEdge(edge);
        nextButton.disabled = false;
    }

    /**
     * Metoda provede nastaveni hrany jako aktualni a zvyrazni ji
     * @param edge hrana ke zvyrazneni
     */
    private highlightEdge(edge: cytoscape.EdgeSingular) {
        this.graphStyler.setDefaultStyle();
        this.graphStyler.updateEdgeColors();
        this.animationSkipped = true;
        this.actualAnimation = this.getEdgeAnimation(edge);
        this.actualAnimation.progress(0.99).play();

        this.updateNodes();
    }

    /**
     * Metoda spusti animaci pro uzel
     * @param startProgress
     */
    private runNodeAnimation(startProgress: number) {

        if (!this.animationSkipped) { //pokud doslo ke stisknuti tlicka pro skok
            if (this.prevAnimProgress == 1.0) { //prev anition is complete
                if (this.actualAnimation != null) { //odbarvení předchozí animace
                    this.actualAnimation.reverse().rewind().play();
                }
                this.actualAnimation = this.getNodeAnimationStyle();
                this.actualAnimation.progress(startProgress).play().promise("complete").then(() => this.runEdgeAnimation(0));
            } else {
                this.actualAnimation = null;
                startProgress = this.prevAnimProgress;
                this.prevAnimProgress = 1.0;
                this.runEdgeAnimation(startProgress);

            }

        }
    }

    /**
     * Metoda vrati styl pro animaci uzlu
     */
    private getNodeAnimationStyle(): cytoscape.AnimationManipulation {
        return this.actualNode.animation({
            position: this.actualNode.position(),
            style: {
                borderWidth: 5,
                borderColor: "red",
            },
            duration: this.animDuration,
            renderedPosition: null,
            easing: null,
        });
    }

    /**
     * Metoda spusti animaci hrany
     * @param startProgress progres, kde ma animace zacit
     */
    private runEdgeAnimation(startProgress: number) {

        if (!this.animationSkipped) {
            if (this.prevAnimProgress == 1.0) {
                if (this.actualAnimation != null) {
                    this.actualAnimation.reverse().rewind().play();
                }
                let edge;
                if (startProgress == 0) {
                    edge = this.getNextEdge();
                } else {
                    edge = this.actualEdge;
                }

                if (edge != null) {
                    this.updateNodes();
                    this.actualAnimation = this.getEdgeAnimation(edge);
                    this.lastEdgeAnimation = this.actualAnimation;
                    this.actualAnimation.progress(startProgress).play().promise("complete").then(() => this.runNodeAnimation(0));
                } else { //absorpcni stav
                    if (this.areIterationsCompleted()) {
                        this.resetAnimation();
                    } else {
                        showDifferential();
                        setSwitchDisabled(true);
                        this.runNextIteration()
                    }
                }


            } else {

                //This happens when you move speed for example
                console.log("Animation NULL");
                this.actualAnimation = null;
                startProgress = this.prevAnimProgress;
                this.prevAnimProgress = 1.0;
                this.runNodeAnimation(startProgress);
            }
        }
    }

    /**
     * Metoda vrati styl pro animaci hrany
     * @param edge zvyraznena hrana
     */
    private getEdgeAnimation(edge: cytoscape.EdgeSingular): cytoscape.AnimationManipulation {

        let edgeAnimation = edge.animation({
            position: edge.sourceEndpoint(),
            style: {
                lineColor: 'red',
                targetArrowColor: 'red',
            },
            duration: this.animDuration,
            renderedPosition: null,
            easing: null,
        });
        this.lastEdgeAnimation = edgeAnimation;
        return edgeAnimation;
    }

    /**
     * Metoda vrati dalsi hranu pro animaci
     */
    private getNextEdge(): cytoscape.EdgeSingular {
        let nextEdge = this.simulation.getNextEdge(this.actualNode);
        if (nextEdge == null) { //INFO absorpcni stav

            this.currentIterationNumber++;
            setCurrentIterationsValue(this.currentIterationNumber);

            if (this.areIterationsCompleted()) {
                this.startAnimationNode = this.actualNode;
            }else {
                this.absorbNode = this.actualNode;
            }

            return null;

        } else {
            this.actualEdge = nextEdge;
            this.actualNode = nextEdge.target();
            return nextEdge;
        }

    }

    /**
     * Metoda pro zmenu rychlosti animace
     * @param value nova rychlost animace
     */
    public changeSpeed(value: number) {
        this.animDuration = value;


        this.prevAnimProgress = this.actualAnimation.progress();
        try {
            if (this.lastEdgeAnimation != null && this.lastEdgeAnimation.reverse().playing()) {
                this.lastEdgeAnimation.reverse().rewind().progress(0.99).play();
            }
        } catch (e) {
            this.animationFailed();
        }

        if (this.actualAnimation != null) {
            try {
                this.actualAnimation.reverse().rewind().progress(0.99).play();
            } catch (e) { //INFO vyjimka muze nastat pokud se animace zmeni driv nez se provede rewind a pro ktery uz je animace null
                this.animationFailed();
            }

        }

        this.actualAnimation = null;

    }

    /**
     * Metoda pro obnovu animace pri jejim padu
     */
    private animationFailed() {
        this.isAnimationFailed = true;
        this.actualAnimation = null;
        this.runAnimation();
    }

    /**
     * Aktualizace hodnot a barvy u vsech uzlu
     */
    public updateNodes() {
        if (this.isAnimationFailed) {
            this.graphStyler.setDefaultStyle();
            this.isAnimationFailed = false;
        }

        this.graphStyler.updateEdgeColors();
        let nodeVisitPercents: Map<string, number> = this.simulation.getNodeVisitProbability(isShowDifferentialEnabled());
        this.graphStyler.updateNodeVisitPercents(nodeVisitPercents, this.nodeActions);
    }

    /**
     * metoda vrati pocet kroku zadanych ve formulari u ovladaciho paneu
     */
    private getStepCount(): number {
        let controlPanel = <HTMLInputElement>document.getElementById("stepCount");
        return +controlPanel.value;
    }

    /**
     * Metoda vrati aktualni simulaci
     */
    public getSimulation(): Simulation {
        return this.simulation;
    }

    public areIterationsCompleted(): boolean {
        return this.currentIterationNumber >= this.maxIterationsNumber;
    }

    private handleEndOfIteration(nodeId: string) {
        if (this.maxIterationsNumber <=1 && this.currentIterationNumber){
            this.simulation.resetSimulation(nodeId);
        }

        if (this.absorbNode){
            this.simulation.resetIteration(this.absorbNode.id(), this.areIterationsCompleted());
        }
    }
}

