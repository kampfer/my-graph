import Behavior from './Behavior';
import * as d3 from 'd3';

export default class SimpleDragDropBehavior extends Behavior {

    constructor(...args) {
        super(...args);
        this.events = {
            'dragstart.node': this.handleDragstart.bind(this),
            'drag.node': this.handleDrag.bind(this),
            'dragend.node': this.handleDragend.bind(this)
        };
    }

    handleDragstart(e, d) {
        this.targetSelection = d3.select(e.sourceEvent.currentTarget);
    }

    handleDrag(e, d) {
        d.x = e.x;
        d.y = e.y;
        this.graph.rerender({ restartForce: false });
    }

    handleDragend(e, d) {
        this.targetSelection = null;
    }

}