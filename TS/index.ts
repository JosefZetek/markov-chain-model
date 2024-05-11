import {GraphConstruction} from './GraphConstruction';
import {GraphAnimator} from './htmlComponents/GraphAnimator';
import {ContextMenu} from './htmlComponents/ContextMenu';
import {NavbarMenu} from './htmlComponents/NavbarMenu';
import {GraphActions} from './actions/GraphActions';
import '../CSS/main.css';
import { GraphStyler } from './graphStyler/GraphStyler';
import { SidePanel } from './htmlComponents/sidePanel';
import { NavbarMenuActions } from './actions/NavbarMenuActions';
import { CodeEditor } from './graphCodeEditor/CodeEditor';
import { NodeGroupsActions } from './actions/NodeGroupsActions';
import { HistoryGraph } from './htmlComponents/HistoryGraph';
import { AnimationActions } from './actions/AnimationActions';

import jsonData from '../JSON/graph.json';

let graphConstruction: GraphConstruction = new GraphConstruction();
// vytvoreni instace z knihovny Cytoscape
let cy = graphConstruction.initGraph("cy");


let navbarMenu = new NavbarMenu(cy);
navbarMenu.addNavbarElements();

let contextmenu: ContextMenu = new ContextMenu(cy, navbarMenu.getGraphActions(), navbarMenu.getNodeGroups());
contextmenu.registerListeners();
let historyGraph = new HistoryGraph(cy);
historyGraph.registerTooltipListener();
