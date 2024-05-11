
import '../../CSS/sidePanel.css';
import { GraphCreator } from './GraphCreator';
import { AnimationActions } from '../actions/AnimationActions';
/**
 * Trida pro zpracovani skriptu zadaneho uzivatelem pro vytvoreni grafu
 */
export class CodeEditor {

    private cy: cytoscape.Core;
    private graphCreator: GraphCreator;
    private checkOutputProb: boolean;
    private animationActions: AnimationActions;
    constructor(cy: cytoscape.Core, animationActions: AnimationActions) {
        this.cy = cy;
        this.animationActions = animationActions;
        this.checkOutputProb = false;
    }
    /**
     * Metoda zpravuje zaddany skrpit uzivatelem a vytvori z nej graf, ktery zobrazi v platne.
     * @param code kod zadany uzivatelem
     */
    public createGraph(code: string) {
        code = this.wrapCode(code);
        let transitions = eval(code);
        this.graphCreator = new GraphCreator(this.cy);
        this.graphCreator.createGraph(transitions, this.checkOutputProb);

        this.animationActions.changeStartingNode(null);
        this.animationActions.resetAnimation();

    }
    /**
     * Metoda obali kod zadany uzivatelem kodem, ktery bude mozne vykonat funkci eval
     * @param code kod zadany uzivatelem
     */
    private wrapCode(code: string): string {

        let addTransitionFnc = '\nfunction addTransition(source, target, value) { \n' + // TODO zkonotrolvat neplatnou value - napr intenzity
                                    'graphTransitions.push({source:source, target:target, value:value});\n' +
                                '}\n';
        let sandBoxCode = '(function() { var graphTransitions = [];\n' + code + addTransitionFnc + ' return graphTransitions;}())'; // kvuli navratove hodnote

        return sandBoxCode;
    }

    public setCheckOutputProb(checkOutputProb: boolean) {
        this.checkOutputProb = checkOutputProb;
    }
}