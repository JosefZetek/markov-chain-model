import cytoscape = require('cytoscape');

/**
 * Abstraktni trida pro stylyzaci hran
 */
export abstract class EdgeStyler {
    protected cy: cytoscape.Core;
    /**
     * Nastaveni stylu vsem hranam
     */
    abstract updateEdgeStyle(): void;
    constructor(cy: cytoscape.Core) {
        this.cy = cy;
    }
    /**
     * Metoda vrati styl pro hranu
     * @param value hodnota hrany
     * @param sourceTargetSame pocatecni a cilovy uzel je stejny
     * @param label oznaceni hrany
     */
    protected getEdgeStyle(value: number, sourceTargetSame: boolean, label: string): any {
        let edgeWidth: number = this.getEdgeWidth(value);
        let edgeColor: string = this.getColorByEdgeValue(value);
        let edgeCurveStyle = sourceTargetSame ? "haystack" : "unbundled-bezier";
        return { width: edgeWidth, lineColor: edgeColor, targetArrowColor: edgeColor, curveStyle: edgeCurveStyle, label: label};

    }

    private getEdgeWidth(value: number): number {
        return Math.ceil(value * 10);
    }

    private getColorByEdgeValue(value: number): string {
        let redColor: number = value * 100;
        let blueColor: number = 150 - value * 100;
        return 'rgb(' + redColor + ', 0, ' + blueColor + ')';
    }
}