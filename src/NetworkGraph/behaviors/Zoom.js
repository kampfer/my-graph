import Behavior from './Behavior';

export default class ZoomBehavior extends Behavior {

    constructor(...args) {
        super(...args);
        this.events = {
            zoom: this.handleZoom.bind(this)
        };
    }

    handleZoom({ transform }) {
        this.graph.gSelection.attr('transform', transform)
    }

}