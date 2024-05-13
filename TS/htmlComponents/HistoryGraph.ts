import cytoscape = require('cytoscape');
import { axisBottom, axisLeft, line, scaleLinear, select } from 'd3';
import '../../CSS/historyGraph.css';
/**
 * Trida se stara o zobrazeni grafu s historii pravdepodobnosti u stavu. Pro zobrazeni grafu se pouziva knihovna D3.js
 */
export class HistoryGraph {

    private nodeIsMoved: boolean = false;

    private cy: cytoscape.Core;
    constructor(cy: cytoscape.Core) {
        this.cy = cy;
    }
    /**
     * Registrace posluchace na najeti na stav. Pri najeti na stav se vytvori div s grafem a zobrazi se. Po opusteni stavu je tento div smazan.
     */
    public registerTooltipListener() {
        let toolTipDiv: HTMLDivElement;
        this.cy.on('mouseover', mouseOverEvent => {

            if (mouseOverEvent.target !== this.cy && (<cytoscape.Singular>mouseOverEvent.target).isNode()) {
                let target = mouseOverEvent.target;
                let data = <number[]>target.data("history");
                let data2 = <number[]>target.data("derHistory");

                if (data !== undefined && data.length > 1) {
                    // console.log(data);
                    toolTipDiv = this.createHistoryGraphDiv(mouseOverEvent);
                    target.addClass("highlighted");
                    this.showGraph(data, data2, "historyGraph");
                }
            }
        });

        this.cy.on('mouseout mousedown', mouseOverEvent => {
            if(mouseOverEvent.target === this.cy)
                return;

            if ((<cytoscape.Singular>mouseOverEvent.target).isEdge())
                return;

            if(toolTipDiv == undefined)
                return;

            toolTipDiv.remove();
            mouseOverEvent.target.removeClass("highlighted");

        });
    }
    /**
     *
     * @param mouseOverEvent Vytvoreni divu s grafem
     */
    private createHistoryGraphDiv(mouseOverEvent: cytoscape.EventObject): HTMLDivElement {
        let toolTipDiv = <HTMLDivElement>document.createElement("DIV");
        toolTipDiv.setAttribute("id", "historyGraph")
        let container = (<HTMLElement>this.cy.container());
        toolTipDiv.style.left = (container.offsetLeft + mouseOverEvent.renderedPosition.x) + "px";
        toolTipDiv.style.top = (container.offsetTop + mouseOverEvent.renderedPosition.y) + "px";
        document.getElementById("cy").appendChild(toolTipDiv);
        return toolTipDiv;

    }
    /**
     * Metoda pro zobrazeni spojnicoveho grafu pomoci knihovny d3.js
     * @param data data pro spojnicovy graf
     * @param elementId element, kde se ma graf zobrazit
     */
    public showGraph(data: number[], data2: number[], elementId: string) {
        // set the dimensions and margins of the graph
        let margin = { top: 20, right: 20, bottom: 40, left: 50 };
        let width = 700 - margin.left - margin.right;
        let height = 300 - margin.top - margin.bottom;

        let x = scaleLinear<number>().range([0, width]);
        let y = scaleLinear<number>().range([height, 0]);

        let graphLine = line<number>()
            .x(function (d, i) {
                return x(i); // i - index in array
            })
            .y(function (d) {
                return y(d);
            })

        let graphLine2 = line<number>()
            .x(function (d, i) {
                return x(i); // i - index in array
            })
            .y(function (d) {
                return y(d);
            });

        // append the svg obgect to the historyGraph
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        let svg = select("#" + elementId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        x.domain([0, data.length]);
        y.domain([0, 1]);
        // y.domain([0, max(data, function(d) { return d; })]);

        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 10) + ")")
            .style("text-anchor", "middle")
            .text("Steps");

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Probability");
        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .style("fill", "none")
            .style("stroke", "steelblue")
            .style("stroke-width", "6px")
            .attr("d", graphLine);
        svg.append("path")
            .data([data2])
            .attr("class", "line2") // nová třída pro styl druhé čáry
            .style("fill", "none")
            .style("stroke", "red")  // např. červená barva pro druhou čáru
            .style("stroke-width", "2px")
            .attr("d", graphLine2);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(axisLeft(y));
    }
}