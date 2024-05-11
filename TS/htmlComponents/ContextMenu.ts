import cytoscape = require('cytoscape');
import { GraphActions } from '../actions/GraphActions';
import { NodeGroupsActions } from '../actions/NodeGroupsActions';
/**
 * Trida se stara o zobrazeni kontextoveho menu
 */
export class ContextMenu {
    private cy: cytoscape.Core;
    private menuElement: HTMLDivElement = null;
    private menuOptionsElement: HTMLUListElement = null;
    private graphActions: GraphActions;
    private nodeGroups: NodeGroupsActions;
    constructor(cy: cytoscape.Core, graphActions: GraphActions, nodeGroups: NodeGroupsActions) {
        this.graphActions = graphActions;
        this.nodeGroups = nodeGroups;
        this.cy = cy;
    }
    /**
     * Registrace posluchacu pro otevreni a zavreni menu
     */
    public registerListeners() {
        this.registerCloseMenuListener();
        this.registerOpenMenuListener();
    }
    /**
     * Metoda nastavi posluchac na kliknuti na platno. Po kliku se menu smaze
     */
    private registerCloseMenuListener() {
        this.cy.on('click', clickEvent => {
            if (this.menuElement != null) {
                this.menuElement.addEventListener('contextmenu', event => event.preventDefault());
                this.menuElement.remove();
                this.menuElement = null;
            }
        });
    }
    /**
     * Vytvoreni kontextoveho menu na miste kliknuti
     * @param renderedPosition
     */
    private createContextMenu(renderedPosition: cytoscape.Position) {
        this.menuElement = <HTMLDivElement> document.createElement("DIV");
        this.menuElement.setAttribute("class", "menu");
        this.menuElement.addEventListener('contextmenu', event => event.preventDefault());
        this.setMenuPosition(renderedPosition);
        this.menuElement.style.display = "block";

        this.menuOptionsElement = <HTMLUListElement> document.createElement("UL");
        this.menuOptionsElement.setAttribute("class", "menu-options");
        this.menuElement.appendChild(this.menuOptionsElement);
        document.getElementById("body").appendChild(this.menuElement);
    }
    /**
     * Nastaveni pozice pro menu v platne
     * @param renderedPosition renderovaci pozice v platne
     */
    private setMenuPosition(renderedPosition: cytoscape.Position) {
        let container = (<HTMLElement>this.cy.container());
        this.menuElement.style.left = (container.offsetLeft + renderedPosition.x) + "px";
        this.menuElement.style.top = (container.offsetTop + renderedPosition.y) + "px";
    }
    /**
     * Metoda nastavuje posluchac na platno na prave tlacitko mysi. Po jeho stisknuti se zobrazi menu
     */
    private registerOpenMenuListener() {
        this.cy.on('cxttapend', rightClickEvent => {
            if (this.menuElement != null) {
                this.menuElement.remove();
                this.menuElement = null;
            }

            let contextMenuItems: ContextMenuItem[] = this.addItems(rightClickEvent);

            if (contextMenuItems.length !== 0) {
                this.showContextMenu(contextMenuItems, rightClickEvent.renderedPosition)
            }
        });
    }
    /**
     * Metoda prida polozky do pole a toto pole vrati
     * @param rightClickEvent akce pri kliknuti
     */
    private addItems(rightClickEvent: any): ContextMenuItem[] {
        let evtTarget = rightClickEvent.target;
        let contextMenuItems: ContextMenuItem[] = new Array();
        if (evtTarget === this.cy) {
            contextMenuItems.push(new ContextMenuItem("Add node", (e: Event) => this.graphActions.addNode(rightClickEvent)));
        } else {
            let element = <cytoscape.Singular>evtTarget;
            if (element.isEdge()) {
                contextMenuItems.push(new ContextMenuItem("Delete edge", (e: Event) => this.graphActions.removeElement(rightClickEvent)));
                contextMenuItems.push(new ContextMenuItem("Change value", (e: Event) => this.graphActions.changeEdgeValue(rightClickEvent)));
            } else if (element.isNode()) {
                contextMenuItems.push(new ContextMenuItem("Delete node", (e: Event) => this.graphActions.removeElement(rightClickEvent)));
                contextMenuItems.push(new ContextMenuItem("Delete selected", (e: Event) => this.graphActions.removeSelectedElements(rightClickEvent)));
                contextMenuItems.push(new ContextMenuItem("Starting node", (e: Event) => this.graphActions.changeStartingNode(rightClickEvent)));
                contextMenuItems.push(new ContextMenuItem("Create group", (e: Event) => this.nodeGroups.addGroup(rightClickEvent)));
            }

        }
        return contextMenuItems;

    }

    private showContextMenu(contextMenuItems: ContextMenuItem[], renderedPosition: cytoscape.Position ) {
        this.createContextMenu(renderedPosition);

        contextMenuItems.forEach(contextMenuItem => {
            let itemElement: HTMLLIElement = this.createItem(contextMenuItem);
            itemElement.addEventListener("click", event => {
                this.menuElement.remove();
                this.menuElement = null;
            })
            this.menuOptionsElement.appendChild(itemElement);
        });
    }
    /**
     * Vytvoreni polozky v menu
     * @param contextMenuItem
     */
    private createItem(contextMenuItem: ContextMenuItem): HTMLLIElement {
        let itemElement: HTMLLIElement = <HTMLLIElement> document.createElement("LI");
        let itemNameElement = document.createTextNode(contextMenuItem.itemName);
        itemElement.appendChild(itemNameElement);

        itemElement.addEventListener("click", contextMenuItem.onClickFunction);
        itemElement.setAttribute("class", "menu-option");
        return itemElement;
    }
}
/**
 * Trida pro polozku v menu
 */
class ContextMenuItem {
    itemName: string;
    onClickFunction: (e: Event) => void;

    constructor(itemName: string, onClickFunction: (e: Event) => void) {
        this.itemName = itemName;
        this.onClickFunction = onClickFunction;
    }
}