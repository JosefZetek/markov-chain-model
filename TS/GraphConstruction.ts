import cytoscape = require('cytoscape');
export class GraphConstruction {
    /**
     * Metoda provede inicializaci platna pro vykreslovani grafu.
     * Osahuje nastaveni pro interakci, renderovani atd.
     * return cy vraci instani jadra knihovny
     */
    public initGraph(elementID: string): cytoscape.Core {
        const cy = cytoscape({
            container: document.getElementById(elementID),

            boxSelectionEnabled: true,
            autounselectify: false,

            // initial viewport state:
            zoom: 1,
            pan: { x: 0, y: 0 },

            // interaction options:
            minZoom: 1e-1,
            maxZoom: 5,
            zoomingEnabled: true,
            userZoomingEnabled: true,
            panningEnabled: true,
            userPanningEnabled: true,
            selectionType: 'single',
            touchTapThreshold: 8,
            desktopTapThreshold: 4,
            autolock: false,
            autoungrabify: false,

            // rendering options:
            headless: false,
            styleEnabled: true,
            hideEdgesOnViewport: false,
            hideLabelsOnViewport: false,
            textureOnViewport: false,
            motionBlur: false,
            motionBlurOpacity: 0.2,
            wheelSensitivity: 1,
            pixelRatio: 'auto',
          });

          return cy;
    }
}
