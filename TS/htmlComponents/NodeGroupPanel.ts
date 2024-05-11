import { NodeGroupsActions } from '../actions/NodeGroupsActions';
/**
 * Trida pro zobrazeni skupin stavu v prave casti aplikace
 */
export class NodeGroupsPanel {
    private nodeGroups: NodeGroupsActions;

    constructor(nodeGroups: NodeGroupsActions, parentElement: HTMLElement) {
        this.nodeGroups = nodeGroups;
        this.nodeGroups.setPanel(this);
        this.addNodeGroupsPanel(parentElement);
    }
    
    /**
     * Metoda pro pridani polozky tabulky, ktera predstavuje skupinu stavu se jmenem name a hodnotou value
     * @param name nazev skupiny
     * @param value hodnota skupiny
     * @param id identifikator polozky
     */
    public addNodeGroup(name: string, value: number, id: string) {
        let tableBody = document.getElementById("tableBody");

        let tableRow = <HTMLTableRowElement> document.createElement("TR");
        tableRow.setAttribute("id", id);
        tableRow.addEventListener("mouseover", e => this.nodeGroups.selectNodesFromGroup(id));
        tableRow.addEventListener("mouseout", e => this.nodeGroups.deselectNodes());

        let tableCellName = tableRow.insertCell(0);
        let tableCellProb = tableRow.insertCell(1);
        let tableCellDelete = tableRow.insertCell(2);

        tableCellName.innerText = name;
        tableCellProb.innerText = value + "";

        let deleteButton = <HTMLButtonElement>document.createElement("BUTTON");
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("class", "btn");
        deleteButton.setAttribute("type", "button")
        deleteButton.addEventListener("click", e => this.removeGroup(id));
        tableCellDelete.appendChild(deleteButton);

        tableBody.appendChild(tableRow);
    }

    private removeGroup(groupId: string) {
        document.getElementById(groupId).remove();
        this.nodeGroups.removeGroup(groupId);
    }

    private addNodeGroupsPanel(parentElement: HTMLElement) {
        let nodeGroupPanel = require('../../HTML/nodeGroups.html');
        parentElement.insertAdjacentHTML('beforeend', nodeGroupPanel);
    }

    public hidden(hidden: boolean) {
        document.getElementById("nodeGroupsPanel").hidden = hidden;
    }
    /**
     * Metoda pro aktualizovani hodnoty u polozky
     * @param value nova hodnota
     * @param id identifikaot polozky
     * @param color barva polozky
     */
    public updateGroupCell(value: number, id: string, color: string) {
        let row = <HTMLTableRowElement>document.getElementById(id);
        row.cells[1].textContent = value + "";
        row.style.backgroundColor = color;
    }




}