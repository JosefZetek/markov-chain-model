import cytoscape = require('cytoscape');


import { AnalyticalSolution } from '../AnalyticalSolution';
import { AlertMessage } from '../htmlComponents/AlertMessage';
import { SimulationIntensity } from '../simulation/SimulationIntensity';
import { Simulation } from '../simulation/Simulation';
import { EdgeStylerIntensity } from '../graphStyler/EdgeStylerIntensity';
import { EdgeIntensityEditorActions } from './editorActions/EdgeIntensityFormActions';
import { SimulationProbability } from '../simulation/SimulationProbability';
import { EdgeStylerProbability } from '../graphStyler/EdgeStylerProbability';
import { EdgeProbFormActions } from './editorActions/EdgeProbFormActions';
import { SidePanel } from '../htmlComponents/sidePanel';
import { GraphActions, ActionMode } from './GraphActions';
import { AnimationActions } from './AnimationActions';
import { HistoryGraph } from '../htmlComponents/HistoryGraph';
import {NodeGroupsActions} from "./NodeGroupsActions";


/**
 * exportovana data
 */
class ExportedData {
    name: string;
    description: string;
    type: string;
    graphData: object;
    code: string;
}
/**
 * Trida s akcemi pro navigacni listu
 */
export class NavbarMenuActions {
    private INTENSITY_EDGE_TYPE = "intensity";
    private PROBABILITY_EDGE_TYPE = "probability";
    private cy: cytoscape.Core;

    private actualEdgeType: string;

    constructor(cy: cytoscape.Core) {
        this.cy = cy;
        this.actualEdgeType = this.INTENSITY_EDGE_TYPE;
    }
    /**
     * Metoda pro zmenu reakce na kliknuti (select, delete, add)
     * @param graphActions Instance na GraphActions
     * @param animationActions Instance na AnimationActions
     * @param actionMode Mod akce
     */
    public changeClickAction(graphActions: GraphActions, animationActions: AnimationActions, actionMode: ActionMode) {

        graphActions.setActionMode(actionMode);

        if (actionMode === ActionMode.Select) {
            animationActions.enableControlPanel(true);
        } else {
            animationActions.enableControlPanel(false);

        }

        animationActions.resetAnimation();

    }
    /**
     * Metoda pro vykonani analytickeho reseni.
     * Pokud je graf silne souvisly, zobrazi se u kazdeho uzlu jeho pravdepodobnosti navstiveni.
     * Jinak se zobrazi hlaska o tom, ze graf neni silne souvisly
     */
    public analyzeSolution(animationActions: AnimationActions, nodeActions: NodeGroupsActions) {
        animationActions.resetAnimation();

        let nodes = this.cy.nodes();
        let analyticalSolution = new AnalyticalSolution(this.cy);
        let solution = analyticalSolution.resolve();
        if (solution != null) {
            let nodeVisitPercents: Map<string, number> = new Map();

            for (let i = 0; i < nodes.size(); i++) {
                nodeVisitPercents.set(nodes[i].id(), solution[i]);
            }

            animationActions.getStyler().updateNodeVisitPercents(nodeVisitPercents, nodeActions);

        } else {
            let alertMessage: AlertMessage = new AlertMessage("The analytical solution can not" +
                    " be done because the graph is not strongly connected.")
            alertMessage.showAlertDanger();
        }
        animationActions.getStyler().updateEdgeColors();
    }
    /**
     * Metoda pro export grafu a nastaveni nastroje
     * @param sidePanel Instance na SidePanel (obsahuje informace o nazvu a popisu grafu)
     */
    public exportGraph(sidePanel: SidePanel) {
        let exportGraph: ExportedData = new ExportedData();

        /* Ziskani informaci o grafu */
        exportGraph.name = sidePanel.getInformationPanel().getName();
        exportGraph.description = sidePanel.getInformationPanel().getDescription();
        exportGraph.code = sidePanel.getCodeEditorPanel().getCode();
        exportGraph.graphData = this.cy.json();
        exportGraph.type = this.actualEdgeType;

        this.downloadContent(JSON.stringify(exportGraph), "json", "graph_export.json");
    }
    /**
     * Metoda pro export cesty simulace
     * @oaram animationActions Instance na AnimationActions
     */
    public exportPath(animationActions: AnimationActions) {
        let content = "id;\r\n";
        animationActions.getSimulation().getSimulationPath().forEach(nodeId => {
            content += nodeId + "; " + "\r\n";
        })
        this.downloadContent(content, "csv", "nodes.csv");
    }
    /**
     * Metoda pro export historie u stavu
     */
    public exportNodesHistory() {
        let graphHistory = new HistoryGraph(this.cy);
        let exportedDiv = <HTMLDivElement>document.createElement("DIV");
        document.getElementById("body").appendChild(exportedDiv);

        this.cy.nodes().forEach(node => {
            let nodeInfo = <HTMLDivElement>document.createElement("DIV");
            let titleNode = document.createElement("H1");
            titleNode.textContent = node.id();
            nodeInfo.appendChild(titleNode);
            nodeInfo.id = "History" + node.id();
            exportedDiv.appendChild(nodeInfo);
            graphHistory.showGraph(node.data("history") , [], "History" + node.id());

        });
        let content = exportedDiv.outerHTML;
        this.downloadContent(content, "html", "nodes_history.html");
        exportedDiv.remove();
    }
    /**
     * Metoda pro stazeni souboru
     * @param content obsah souboru
     * @param type typ souboru
     * @param fileName nazev souboru
     */
    private downloadContent(content: string, type: string, fileName: string) {
        let  dataStr = "data:text/" + type + ";charset=utf-8," + encodeURIComponent(content);
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    /**
     * Metoda pro nacteni grafu z json objektu
     * @param sidePanel Instance na SidePanel pro nastaveni nazvu a popisu grafu
     * @param animationActions Instance na AnimationActions
     * @param graphActions
     * @param jsonText json objekt v textove podobe
     */
    public loadGraphFromJson(sidePanel: SidePanel, animationActions: AnimationActions, graphActions: GraphActions, jsonText: string) {
        let data: ExportedData = JSON.parse(jsonText);
        this.cy.json(data.graphData);

        sidePanel.getInformationPanel().setName(data.name);
        sidePanel.getInformationPanel().setDescription(data.description);

        if (data.type === this.INTENSITY_EDGE_TYPE) {
            sidePanel.getCodeEditorPanel().setCode(data.code);
            this.setIntensityMode(animationActions, graphActions, sidePanel);
        } else {
            this.setProbabilityMode(animationActions, graphActions, sidePanel);
        }
    }
    /**
     * Metoda pro import grafu
     * @param sidePanel Instance na SidePanel k zobrazeni informaci o grafu
     * @param animationActions Instance na AnimationActions
     * @param graphActions Instance na GraphActions
     * @param event udalost potvrzeni okna pri vyberu souboru
     */
    public importGraph(sidePanel: SidePanel, animationActions: AnimationActions, graphActions: GraphActions, event: Event) {
        let files = (<HTMLInputElement>event.target).files; // FileList object
        let reader = new FileReader();
        reader.onload = () => {
            this.loadGraphFromJson(sidePanel, animationActions, graphActions, reader.result.toString());
        };
        reader.readAsText(files[0]);
    }
    /**
     * Metoda pro prepnuti z modu s pravdepodobnostmi na mod s intenzitami u hran (Mark. rezetec se spojitym casem)
     * @param animationActions
     * @param graphActions Instance na GraphActions
     */
    public changeToIntensityMode(animationActions: AnimationActions, graphActions: GraphActions, sidePanel: SidePanel) {
        graphActions.changeToIntesity();
        this.setIntensityMode(animationActions, graphActions, sidePanel);
    }
    /**
     * Metoda pro prepnuti z modu s pravdepodobnostmi na mod s intenzitami u hran (Mark. rezetec s diskretnim casem)
     * @param animationActions Instance na AnimationActions
     * @param graphActions Instance na GraphActions
     * @param sidePanel Instance na SidePanel
     */
    public changeToProbabilityMode(animationActions: AnimationActions, graphActions: GraphActions, sidePanel: SidePanel) {
        graphActions.changeToProbability();
        this.setProbabilityMode(animationActions, graphActions, sidePanel);
    }
    /**
     * Metoda pro nastaveni modu na intenziy (Mark. rezetec se spojitym casem)
     */
    public setIntensityMode(animationActions: AnimationActions, graphActions: GraphActions, sidePanel: SidePanel) {

        let simulationIntesity: Simulation = new SimulationIntensity(this.cy);
        animationActions.changeSimulation(simulationIntesity);

        let graphStyler = animationActions.getStyler();
        graphStyler.changeEdgeStyler(new EdgeStylerIntensity(this.cy));
        graphActions.changeValueEditor(new EdgeIntensityEditorActions(this.cy, graphStyler));

        animationActions.resetAnimation();
        this.actualEdgeType = this.INTENSITY_EDGE_TYPE;
        sidePanel.getCodeEditorPanel().getCodeEditor().setCheckOutputProb(false);
    }

    /**
     * Metoda pro nastaveni modu na pravdepodobnosti (Mark. rezetec s diskretnim casem)
     */
    public setProbabilityMode(animationActions: AnimationActions, graphActions: GraphActions, sidePanel: SidePanel) {
        let simulationProbability: Simulation = new SimulationProbability(this.cy);
        animationActions.changeSimulation(simulationProbability);

        let graphStyler = animationActions.getStyler();
        graphStyler.changeEdgeStyler(new EdgeStylerProbability(this.cy));
        graphActions.changeValueEditor(new EdgeProbFormActions(this.cy, graphStyler));

        animationActions.resetAnimation();
        this.actualEdgeType = this.PROBABILITY_EDGE_TYPE;
        sidePanel.getCodeEditorPanel().getCodeEditor().setCheckOutputProb(true);
    }
}