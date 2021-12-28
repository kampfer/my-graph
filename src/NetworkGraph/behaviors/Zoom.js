import Behavior from './Behavior';

export default class ZoomBehavior extends Behavior {

    constructor(...args) {
        super(...args);
        this.events = {
            'zoom': this.handleZoom.bind(this),
            'zoomstart': this.handleZoomstart.bind(this),
            'zoomend': this.handleZoomend.bind(this),
        };
    }

    handleZoom({ transform }) {
        this.graph.gSelection.attr('transform', transform);
    }

    handleZoomstart() {
        clearTimeout(this.zoomendTimer);
        if (this.graph._data.edges.length + this.graph._data.nodes.length > 2000) {
            this.graph.toggleEdge(false);
        }
    }

    handleZoomend() {
        this.zoomendTimer = setTimeout(() => this.graph.toggleEdge(true), 100)
    }

}