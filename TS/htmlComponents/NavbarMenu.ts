import { NavbarMenuActions } from '../actions/NavbarMenuActions';
import {ActionMode, GraphActions} from '../actions/GraphActions';
import '../../CSS/navbar.css';
import { SubmitDialog } from './submitDialog';
import {NodeGroupsActions} from "../actions/NodeGroupsActions";
import {GraphStyler} from "../graphStyler/GraphStyler";
import {AnimationActions} from "../actions/AnimationActions";
import {GraphAnimator} from "./GraphAnimator";
import {CodeEditor} from "../graphCodeEditor/CodeEditor";
import {SidePanel} from "./SidePanel";
import {GraphConstruction} from '../GraphConstruction';
import cytoscape from "cytoscape";
import jsonData from "../../JSON/graph.json";

/**
 * Trida pro zobrazeni navigacni listy
 */
export class NavbarMenu {

    private navbarActions: NavbarMenuActions;
    private graphActions: GraphActions;
    private nodeGroupsActions: NodeGroupsActions;
    private sidePanel: SidePanel;
    private animationActions: AnimationActions;

    constructor(cy: cytoscape.Core) {
        this.navbarActions = new NavbarMenuActions(cy);
        this.nodeGroupsActions = new NodeGroupsActions(cy);
        let graphStyler = new GraphStyler(cy);
        this.animationActions = new AnimationActions(cy, graphStyler, this.nodeGroupsActions);
        let graphAnimator: GraphAnimator = new GraphAnimator(this.animationActions);
        this.graphActions = new GraphActions(cy, this.animationActions);
        let codeEditor = new CodeEditor(cy, this.animationActions);
        this.sidePanel = new SidePanel(codeEditor, this, this.nodeGroupsActions);

        this.navbarActions.loadGraphFromJson(this.sidePanel, this.animationActions, this.graphActions, JSON.stringify(jsonData));
    }
    /**
     * Metoda pro pridani jendotlivych elementu do navigacni listy
     */
    public addNavbarElements() {
        // console.log("Adding navbar elements...");
        let radioButtonLabelMode = this.addRadioButtonPanel();
        this.addRadioButtonItem(radioButtonLabelMode, "mode", "selectRadio", "Select", true, (e: Event) => this.changeClickAction(e, ActionMode.Select));
        this.addRadioButtonItem(radioButtonLabelMode, "mode", "addRadio", "Add", false, (e: Event) => this.changeClickAction(e, ActionMode.Add));
        this.addRadioButtonItem(radioButtonLabelMode, "mode", "deleteRadio", "Delete", false, (e: Event) => this.changeClickAction(e, ActionMode.Delete));

        let radioButtonLabelType = this.addRadioButtonPanel();
        this.addRadioButtonItem(radioButtonLabelType, "type", "intesityRadio", "Intesity", true, (e: Event) => this.switchToIntensityMode());
        this.addRadioButtonItem(radioButtonLabelType, "type", "probabilityRadio", "Probability", false, (e: Event) => this.switchToProbabilityMode());

        this.addNavbarElement("Analytical solution", (e: Event) => this.navbarActions.analyzeSolution(this.animationActions, this.nodeGroupsActions));
        this.addImportItem();
        this.addNavbarElement("Export", (e: Event) => this.navbarActions.exportGraph(this.sidePanel));

        this.addNavbarElement("Export path", (e: Event) => this.navbarActions.exportPath(this.animationActions));
        this.addNavbarElement("Export states history", (e: Event) => this.navbarActions.exportNodesHistory());
        this.addNavbarElement("Code editor", (e: Event) => this.sidePanel.showCodeEditor());
        this.addNavbarElement("State groups", (e: Event) => this.sidePanel.showNodeGroups());
        this.addNavbarElement("Library", (e: Event) => this.sidePanel.showLibrary());
        this.addNavbarElement("Information", (e: Event) => this.sidePanel.showInformation());
        //this.addDirectoryPickerItem();
    }
    /**
     * Metoda prida polozku pro import
     */
    private addImportItem() {
        let navbarMenu = document.getElementById("navbarMenu");
        let menuItem = <HTMLLabelElement> document.createElement("LABEL");
        menuItem.setAttribute("class", "nav-item nav-link importItem");
        menuItem.appendChild(document.createTextNode("Import"));
        let input = <HTMLInputElement> document.createElement("INPUT");
        input.setAttribute("type", "file");
        input.setAttribute("style", "display: none;");
        menuItem.addEventListener("change",  e => this.navbarActions.importGraph(this.sidePanel, this.animationActions, this.graphActions, e));
        menuItem.appendChild(input);
        navbarMenu.appendChild(menuItem);
    }
    /**
     * Metoda prida polozku se jmenem name do navigacni listy.  Prida akci, ktera se vykona pri kliknuti na tuto polozku
     * @param name nazev polozky
     * @param onClickFunction akce vyvolana pri kliknuti na polozku
     */
    private addNavbarElement(name: string, onClickFunction: (e: Event) => void ) {
        let navbarMenu = document.getElementById("navbarMenu");
        let menuItem = <HTMLAnchorElement> document.createElement("A");
        menuItem.setAttribute("class", "nav-item nav-link");
        menuItem.setAttribute("href", "#");

        menuItem.appendChild(document.createTextNode(name));
        menuItem.addEventListener("click", onClickFunction);
        navbarMenu.appendChild(menuItem);
        console.log(`Adding navbar element: ${name}`);
    }
    /**
     * Prida panel pro radio buttony do navigacni listy
     */
    private addRadioButtonPanel(): HTMLDivElement {
        let navbarMenu = document.getElementById("navbarMenu");
        let buttonGroup = <HTMLDivElement> document.createElement("DIV");
        buttonGroup.setAttribute("class", "btn-group btn-group-toggle radioButtonPanel");
        buttonGroup.setAttribute("data-toggle", "buttons");
        navbarMenu.appendChild(buttonGroup);
        return buttonGroup;
    }
    /**
     * Pridani radio buttonu do skupiny s dalsimi radio buttony.
     * @param buttonGroup skupina s radio buttony, kam se ma pridat novy radio button
     * @param buttonGroupName nazev skupiny
     * @param itemName nazev noveho radio buttonu
     * @param label oznaceni noveho radio button
     * @param isActive priznak pro aktinvni radio button
     * @param onClickFunction akce pri kliknuti
     */
    private addRadioButtonItem(buttonGroup: HTMLDivElement, buttonGroupName: string, itemName: string, label: string, isActive: boolean,
        onClickFunction: (e: Event) => void) {

        let active = isActive ? "active" : "";

        let buttonLabel = <HTMLLabelElement> document.createElement("LABEL");
        buttonLabel.setAttribute("class", "btn btn-secondary radioButtonPanelItem " + active);
        buttonLabel.setAttribute("id", itemName + "Label");
        buttonLabel.textContent = label;
        buttonLabel.addEventListener("click", onClickFunction);

        let inputRadio = <HTMLInputElement> document.createElement("INPUT");
        inputRadio.setAttribute("name", buttonGroupName);
        inputRadio.setAttribute("type", "radio");
        inputRadio.setAttribute("id", itemName);
        inputRadio.setAttribute("autocomplete", "off");
        inputRadio.checked = isActive;

        buttonLabel.appendChild(inputRadio);
        buttonGroup.appendChild(buttonLabel);
    }
    /**
     * Akce pro zmenu modu na intezity(Mark. retezec se spojitym casem)
     */
    private switchToIntensityMode() {
        if (!(<HTMLInputElement>document.getElementById('intesityRadio')).checked) {
            let onSubmitAction = () => this.navbarActions.changeToIntensityMode(this.animationActions, this.graphActions, this.sidePanel);
            let onCancelAction = () => this.changeActiveType(false);
            let submitDialog = new SubmitDialog("Switching to intensity mode", "Edge intensities will be changed to probabilities." +
                                                "This change can not be returned.", onSubmitAction, onCancelAction);
            submitDialog.showDialog();
        }
    }
    /**
     * Akce pro zmenu modu na pravdepodobnosti(Mark. retezec s diskretnim casem)
     */
    private switchToProbabilityMode() {
        if (!(<HTMLInputElement>document.getElementById('probabilityRadio')).checked) {
            let onSubmitAction = () => this.navbarActions.changeToProbabilityMode(this.animationActions, this.graphActions, this.sidePanel);
            let onCancelAction = () => this.changeActiveType(true);
            let submitDialog = new SubmitDialog("Switching to probability mode", "Edge intensities will be changed to probabilities." +
                                                "This change can not be returned.", onSubmitAction, onCancelAction);
            submitDialog.showDialog();
        }
    }
    /**
     * Akce pro zmenu aktivniho typu Probability/Intensity
     * @param activeIntesity flag pro aktivaci modu Intesity
     */
    private changeActiveType(activeIntesity: boolean) {
        (<HTMLInputElement>document.getElementById('intesityRadio')).checked = activeIntesity;
        (<HTMLInputElement>document.getElementById('probabilityRadio')).checked = !activeIntesity;
        if (activeIntesity) {
            document.getElementById('probabilityRadioLabel').classList.remove("active");
            document.getElementById('intesityRadioLabel').classList.add("active");
        } else {
            document.getElementById('probabilityRadioLabel').classList.add("active");
            document.getElementById('intesityRadioLabel').classList.remove("active");
        }

    }

    private changeClickAction(e: Event, actionMode: ActionMode) {
        this.navbarActions.changeClickAction(this.graphActions, this.animationActions, actionMode);
    }

    /* ------------------------GETTERS------------------------ */

    /**
     * Metoda vrati instanci tridy GraphActions
     */
    public getGraphActions(): GraphActions {
        return this.graphActions;
    }

    /**
     * Metoda vrati instanci tridy NodeGroupsActions
     */
    public getNodeGroups(): NodeGroupsActions {
        return this.nodeGroupsActions;
    }

    /**
     * Metoda vrati instanci tridy SidePanel
     */
    public getSidePanel(): SidePanel {
        return this.sidePanel;
    }

    /**
     * Metoda vrati instanci tridy AnimationActions
     */
    public getAnimationActions(): AnimationActions {
        return this.animationActions;
    }

    public getNavbarMenuActions() {
        return this.navbarActions;
    }
}