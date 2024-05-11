import cytoscape = require('cytoscape');
import { EdgeStyler } from './EdgeStyler';
import { EdgeStylerIntensity } from './EdgeStylerIntensity';
import { NodeGroupsActions } from '../actions/NodeGroupsActions';
/**
 * Trida se stara o stylizaci grafu
 */

export class GraphStyler {

    protected cy: cytoscape.Core;
    private edgeStyler: EdgeStyler;
    constructor(cy: cytoscape.Core) {
        this.cy = cy;
        this.edgeStyler = new EdgeStylerIntensity(cy);
    }
    /**
     * Metod a provede nastaveni vychoziho stylu pro hrany i uzly grafu
     */
    public setDefaultStyle() {
        this.cy.style(this.getGraphStyleSheet());
        this.setDefaultNodeStyle();
        this.edgeStyler.updateEdgeStyle();
    }

    public updateEdgeColors() {
        this.edgeStyler.updateEdgeStyle();
    }

    public changeEdgeStyler(edgeStyler: EdgeStyler) {
        this.edgeStyler = edgeStyler;
    }
    /**
     * Vychozi nastaveni vzhledu grafu
     */
    private getGraphStyleSheet(): cytoscape.Stylesheet[] {
        let styleSheet: cytoscape.Stylesheet[] = [
            {
              selector: 'node',
              css: {
                'color': 'white',
                'text-outline-width': 2,
                'background-color': 'white',
                'text-outline-color': 'black',
                'border-width': 1,
                'font-size': 20,
                'border-color': "black",
                'text-valign': 'center',
                'width': 50,
                'height': 50,
                "text-wrap": "wrap",
              }
            },
            {
              selector: 'edge',
              css: {
                'text-rotation': 'autorotate',
                'color': "white",
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#ccc',
                'line-color': 'rgb(255, 0, 0)',
                'width': 10,
                "text-outline-color": "black",
                "text-outline-width": 2,
                "target-text-offset": 50,
                "font-size" : 13

              }
            },
            {
              selector: ':selected',
              css: {
                'line-color': 'black',
                'target-arrow-color': 'black',
                'source-arrow-color': 'black',
                'overlay-color': "black",
                "overlay-padding": 2,
                "overlay-opacity": 0.4
              },
            },
            {
              selector: '.highlighted',
              css: {
                "overlay-color": "black",
                        "overlay-padding": 10,
                        "overlay-opacity": 0.25
              }
            }
          ];

          return styleSheet;
    }
    /**
     * Metoda projde vsechny uzly a nastavi kazdemu vychozi vzhled a pravdepodobnost navstiveni na 0
     */
    private setDefaultNodeStyle() {
        this.cy.nodes().forEach((node) => {
            node.data("visitPercent", 0);
            node.style({
                backgroundColor: "white",
                borderColor: "black",
                borderWidth: 1,
                label: 0,
            });
        });
    }

    public updateNodeVisitPercents(nodeVisitPercents: Map<string, number>, nodeGroups: NodeGroupsActions) {
        nodeGroups.updateGroups(nodeVisitPercents);
        this.setDefaultNodeStyle();

        nodeVisitPercents.forEach((value: number, key: string) => {
            let nodeElement = <cytoscape.NodeSingular>this.cy.getElementById(key);
            let roundDecimal: number = +(Math.round(+(value + "e+3"))  + "e-3");
            nodeElement.data("visitPercent", roundDecimal);
            nodeElement.style({
                backgroundColor: this.getColorByFrequency(value),
                label: roundDecimal
                // label: roundDecimal + "\n("+key+")"
            });

        });
    }
    /**
     * Metoda pro zjisteni barvy podle velikosti hodnoty(pravdepodobnost navstiveni)
     * function from library lesscss. http://lesscss.org/functions/#color-operations-mix
     * @param value pravdepodobnsot navstiveni uzlu
     */
    public getColorByFrequency(value: number) {
        let color2 = [255, 255, 0];
        let color1 = [139, 0, 0];
        let p = value;
        let w = p * 2 - 1;
        let w1 = (w / 1 + 1) / 2;
        let w2 = 1 - w1;
        let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)];
        return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    }
}