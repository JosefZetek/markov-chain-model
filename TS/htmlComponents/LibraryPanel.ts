import "ace-builds/src-noconflict/mode-javascript";
import '../../CSS/sidePanel.css';
import "ace-builds/webpack-resolver";
import { NavbarMenuActions } from '../actions/NavbarMenuActions';
import cytoscape from "cytoscape";

import test_data from '../../JSON/graph_export.json';
import {NavbarMenu} from "./NavbarMenu";
import {GraphConstruction} from "../GraphConstruction";
import {GraphStyler} from "../graphStyler/GraphStyler";
import {AnimationActions} from "../actions/AnimationActions";
import {NodeGroupsActions} from "../actions/NodeGroupsActions";

class ExportedData {
    name: string;
    description: string;
    type: string;
    graphData: object;
    code: string;
}


export class LibraryPanel {
    // The way of obtaining the files cannot be done in the client side
    private fileList: string[] = [];
    private container: HTMLElement;
    private navbarActions: NavbarMenuActions;
    private navbarMenu: NavbarMenu;
    private cy: cytoscape.Core;
    private graphStyler: GraphStyler;
    private nodeActions: NodeGroupsActions;

    private selectedFile: string;

    constructor(container: HTMLElement, navbarMenu: NavbarMenu, navbarActions: NavbarMenuActions, nodeActions: NodeGroupsActions) {
        this.container = container;
        this.navbarMenu = navbarMenu;
        this.navbarActions = navbarActions;
        this.nodeActions = nodeActions;
        this.container.innerHTML = '';
        this.addSearchBar();
        this.initFileListDisplay();
        this.updateFileDisplay(this.fileList);
    }

    private initializeCytoscape(data : string): cytoscape.Core {
        let jsonData = JSON.parse(data);

        let cy = cytoscape({
            container: document.getElementById('graph-preview-container'),
            elements: jsonData.graphData.elements,
            style: jsonData.graphData.style,
            zoom: jsonData.graphData.zoom/3.5,
            minZoom: jsonData.graphData.minZoom,
            maxZoom: jsonData.graphData.maxZoom,
            pan: {x: 0, y: 100},
            zoomingEnabled: false,
            userZoomingEnabled: false,
            panningEnabled: false,
            userPanningEnabled: false,
            boxSelectionEnabled: jsonData.graphData.boxSelectionEnabled
        });

        this.graphStyler = new GraphStyler(cy);
        return cy;
    }

    private addSearchBar() {
        const searchInput: HTMLInputElement = document.createElement("input");
        searchInput.type = "search";
        searchInput.placeholder = "Search Files";
        searchInput.className = "input_field";
        this.container.insertBefore(searchInput, this.container.firstChild);

        searchInput.addEventListener('input', () => {
            this.filterFiles(searchInput.value);
        });
    }

    private initFileListDisplay() {
        const listContainer = document.createElement("div");
        listContainer.id = "file-list-container";
        listContainer.style.overflowY = "scroll";
        listContainer.style.maxHeight = "100%";
        this.container.appendChild(listContainer);

        const graphPreviewContainer = document.createElement("div");
        graphPreviewContainer.id = "graph-preview-container";
        graphPreviewContainer.style.width = "100%";
        graphPreviewContainer.style.height = "250px";
        graphPreviewContainer.style.border = "1px solid #ccc";
        graphPreviewContainer.style.paddingTop = "20px";
        graphPreviewContainer.style.backgroundColor = "#fff"
        this.container.appendChild(graphPreviewContainer);
    }

    private setupCytoscape() {
        this.graphStyler.updateEdgeColors();
        this.graphStyler.setDefaultStyle();
    }

    private selectFile(fileName: string) {
        console.log(`Selected file: ${fileName}`);
        const fileListContainer = this.container.querySelector('#file-list-container') as HTMLElement;
        const fileItems = fileListContainer.querySelectorAll('.file-item');

        fileItems.forEach((item: HTMLElement) => {
            if (item.textContent === fileName) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    private filterFiles(searchTerm: string) {
        const filteredFiles = this.fileList.filter(file => file.includes(searchTerm));
        this.updateFileDisplay(filteredFiles);
    }

    // I need a way to get the name form the json files or parse just the names but have access to the file itself
    private updateFileDisplay(files: string[]) {


        const listContainer = this.container.querySelector('#file-list-container') as HTMLElement;
        listContainer.innerHTML = ''; // Clear the existing file list

        let differentFiles = []
        differentFiles.push(test_data);

        differentFiles.forEach(file => {
            const fileNameItem = document.createElement('div');
            fileNameItem.className = 'file-item';
            fileNameItem.textContent = file.name;
            fileNameItem.onclick = () => this.selectFile(file.name);

            const fileDescription: HTMLDivElement = document.createElement('div');
            fileDescription.className = 'file-item-description';
            fileDescription.textContent = file.description;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            const previewButton = document.createElement('button');
            previewButton.textContent = 'Preview';
            previewButton.onclick = () => this.previewGraph(JSON.stringify(file));
            buttonContainer.appendChild(previewButton);

            const loadButton = document.createElement('button');
            loadButton.textContent = 'Load';
            loadButton.onclick = () => this.loadGraph(this.navbarActions, JSON.stringify(file));
            buttonContainer.appendChild(loadButton);

            fileNameItem.appendChild(buttonContainer);

            listContainer.appendChild(fileNameItem);
            listContainer.appendChild(fileDescription)
        });
    }
    public hidden(hidden: boolean) {
        this.container.hidden = hidden;
    }
    // I need a way to get the name form the json files
    private previewGraph(jsonText: string) {

        console.log("Previewing graph");
        console.log(jsonText);

        let data: ExportedData = JSON.parse(jsonText);

        this.cy = this.initializeCytoscape(jsonText);

        console.log(data.graphData);
        this.cy.json(data.graphData);
        //let animationActions = new AnimationActions(this.cy, this.graphStyler, this.nodeActions);
        //animationActions.resetAnimation();
        this.setupCytoscape();

    }
    // I need a way to get the name form the json files
    private loadGraph(navbarActions: NavbarMenuActions, jsonText: string ) {
        //console.log(`Loading graph from json: ${jsonText}`);
        this.navbarActions.loadGraphFromJson(this.navbarMenu.getSidePanel(), this.navbarMenu.getAnimationActions(), this.navbarMenu.getGraphActions(), jsonText);
    }



}
