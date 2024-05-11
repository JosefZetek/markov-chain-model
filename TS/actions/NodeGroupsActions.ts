import cytoscape = require('cytoscape');
import { NodeGroupsPanel } from '../htmlComponents/NodeGroupPanel';
import { FormDialogActions } from './editorActions/FormDialogActions';
import { GraphStyler } from '../graphStyler/GraphStyler';

/**
 * Trida pro spravu skupin stavu
 */
export class NodeGroupsActions {
    private nodeGroupsPanel: NodeGroupsPanel;
    private groups: Map<string, cytoscape.NodeCollection>;
    private cy: cytoscape.Core;
    private editorActions: FormDialogActions

    constructor(cy: cytoscape.Core) {
        this.cy = cy;
        this.groups = new Map();
    }
    /**
     * Metoda provadi aktualizaci hodnot pravdepodobnosti navstiveni
     * @param nodeProbability mapa s uzly ve skupine <id uzlu, hodnota ppsti>
     */
    public updateGroups(nodeProbability: Map<string, number>) {
        let graphStyler = new GraphStyler(this.cy);
        this.groups.forEach((nodes: cytoscape.NodeCollection, id: string) => {
            let sum = 0;
            nodes.forEach(node => {
                if (nodeProbability.has(node.id())) {
                    sum += nodeProbability.get(node.id());
                }
            })
            this.nodeGroupsPanel.updateGroupCell(Math.round(sum * 1000) / 1000, id, graphStyler.getColorByFrequency(sum));
        });
    }
    /**
     * Metoda pro pridani skupiny
     * @param event udalost pri vytvareni skupiny
     */
    public addGroup(event: cytoscape.EventObject) {
        this.editorActions = new FormDialogActions(this.cy, () => this.submitAddGroup(), "Name of group");
        this.editorActions.showDialog("", event.renderedPosition);
    }


    /**
     * Metoda prida novou skupinu vybranych uzlu
     */
    private submitAddGroup() {
        let selectedNodes = this.cy.$(':selected').nodes();
        let date = new Date();
        let name = this.editorActions.getValue();
        let id = name + "_" + date.getTime();
        this.groups.set(id, selectedNodes);
        let sum = 0;
        selectedNodes.forEach((node) => {
            sum += +node.data("visitPercent");
        });
        this.nodeGroupsPanel.addNodeGroup(name, sum, id);
    }
    /**
     * Metoda provede zvyrazeneni uzlu ve skupine
     * @param groupId  id skupiny
     */
    public selectNodesFromGroup(groupId: string) {
        this.cy.nodes().unselect();
        let nodes = this.groups.get(groupId);
        nodes.select();
    }
    /**
     * Metoda zrusi vyber
     */
    public deselectNodes() {
        this.cy.nodes().unselect();
    }

    public setPanel(nodeGroupsPanel: NodeGroupsPanel) {
        this.nodeGroupsPanel = nodeGroupsPanel;
    }

    /**
     * Odstraneni skupiny
     * @param groupId id skupinty
     */
    public removeGroup(groupId: string) {
        this.groups.delete(groupId);
    }
}