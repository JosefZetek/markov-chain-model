
import '../../CSS/sidePanel.css';
import { CodeEditor } from '../graphCodeEditor/CodeEditor';
import { NodeGroupsActions } from '../actions/NodeGroupsActions';
import { CodeEditorPanel } from './CodeEditorPanel';
import { NodeGroupsPanel } from './NodeGroupPanel';
import { LibraryPanel} from './LibraryPanel';
import {NavbarMenuActions} from "../actions/NavbarMenuActions";
import {InformationPanel} from "./InformationPanel";
import {NavbarMenu} from "./NavbarMenu";
/**
 * Trida pro zobrzeni postraniho panelu vpravo
 */
export class SidePanel {

    /* Things that may be displayed on the side panel */
    private codeEditorPanel: CodeEditorPanel;
    private nodeGroupsPanel: NodeGroupsPanel;
    private directoryPanel: LibraryPanel;
    private informationPanel: InformationPanel;

    private navBarMenuActions: NavbarMenuActions;

    constructor(codeEditor: CodeEditor, navbarMenu: NavbarMenu, nodeGroups: NodeGroupsActions) {

        let sidePanel = require('../../HTML/sidePanel.html');
        document.getElementById("rightSidePanel").insertAdjacentHTML('beforeend', sidePanel);
        document.getElementById("sidePanelCloseButton").addEventListener("click", e => this.closeSidePanel());

        this.codeEditorPanel = new CodeEditorPanel(codeEditor, document.getElementById("codeEditorContainer"));
        this.nodeGroupsPanel = new NodeGroupsPanel(nodeGroups, document.getElementById("nodeGroupsContainer"));
        this.directoryPanel = new LibraryPanel(document.getElementById("directoryPanelContainer"), navbarMenu, navbarMenu.getNavbarMenuActions(), nodeGroups);
        this.informationPanel = new InformationPanel(document.getElementById("informationPanelContainer"));

        this.showCodeEditor();
    }

    public showNodeGroups() {
        this.showSidePanel();
        this.nodeGroupsPanel.hidden(false);
        this.codeEditorPanel.hidden(true);
        this.directoryPanel.hidden(true);
        this.informationPanel.hidden(true);
    }

    public showCodeEditor() {
        this.showSidePanel();
        this.codeEditorPanel.hidden(false);
        this.nodeGroupsPanel.hidden(true);
        this.directoryPanel.hidden(true);
        this.informationPanel.hidden(true);
    }

    public showLibrary() {
        this.showSidePanel();
        this.codeEditorPanel.hidden(true);
        this.nodeGroupsPanel.hidden(true);
        this.informationPanel.hidden(true);
        this.directoryPanel.hidden(false);
    }

    public showInformation() {
        this.showSidePanel();
        this.codeEditorPanel.hidden(true);
        this.nodeGroupsPanel.hidden(true);
        this.informationPanel.hidden(false);
        this.directoryPanel.hidden(true);
    }


    private showSidePanel() {
        document.getElementById("leftPanelCanvas").classList.remove("fullsize");
        document.getElementById("rightSidePanel").hidden = false;
    }

    private closeSidePanel() {
        document.getElementById("rightSidePanel").hidden = true;
        document.getElementById("leftPanelCanvas").classList.add("fullsize");
    }

    public getCodeEditorPanel(): CodeEditorPanel {
        return this.codeEditorPanel;
    }

    public getInformationPanel(): InformationPanel {
        return this.informationPanel;
    }

    /*
    public showDirectoryPanel(files: FileList) {
        this.showSidePanel();
        if (!this.directoryPanel) {
            this.directoryPanel = new DirectoryPanel(document.getElementById("sidePanelContent"), this.navBarMenuActions);
        }
        this.directoryPanel.hidden(false);
    }
     */

}