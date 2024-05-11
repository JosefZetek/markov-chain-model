import '../../CSS/animatorPanel.css';
import { AnimationActions } from '../actions/AnimationActions';

/**
 * Trida pro zobrazeni panelu pro ovadnani animace
 */
export class GraphAnimator {

    private animationActions: AnimationActions;
    constructor(animationActions: AnimationActions) {
        this.animationActions = animationActions;

        this.createAnimationPanel();
        this.registerListeners();

    }
    /**
     * Nacteni panelu ze souboru a zobrazeni v divu
     */
    private createAnimationPanel() {
        let animationPanel = require('../../HTML/animationPanel.html');
        document.getElementById("animationPanel").insertAdjacentHTML('beforeend', animationPanel);
    }
    /**
     * Regiratrace akci na tlacitka v panele pro ovladani animace
     */
    private registerListeners() {
        let runButton = document.getElementById("runButton");
        runButton.addEventListener("click", () => this.animationActions.runAnimation());

        let nextButton = <HTMLButtonElement>document.getElementById("nextButton");
        nextButton.addEventListener("click", () => this.animationActions.highlightNextStep());

        let prevButton = document.getElementById("prevButton");
        prevButton.addEventListener("click", () => this.animationActions.resetAnimation());

        let speedSlider = <HTMLInputElement>document.getElementById("speedSlider");
        speedSlider.addEventListener("change", () => this.animationActions.changeSpeed(+speedSlider.max - +speedSlider.value));

        let switchCheckBox = <HTMLInputElement>document.getElementById("switch");
        switchCheckBox.addEventListener("click", () => this.animationActions.updateNodes());
    }
    /**
     * Metoda pro zobrazeni/skryti panelu
     * @param enable tru pro zobrazeni panelu
     */
    public enableControlPanel(enable: boolean) {
        let controlPanel = document.getElementById("animationPanel");
        controlPanel.hidden = !enable;
    }
}
