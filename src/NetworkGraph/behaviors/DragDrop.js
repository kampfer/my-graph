import Behavior from './Behavior';

export default class DragDropBehavior extends Behavior {

    constructor(...args) {
        super(...args);
        this.events = {
            'dragstart.node': this.handleDragstart.bind(this),
            'drag.node': this.handleDrag.bind(this),
            'dragend.node': this.handleDragend.bind(this)
        };
    }

    handleDragstart(event, d) {
        d.x = event.x;
        d.y = event.y;
        this.graph.render();
    }

    handleDrag(event, d) {
        d.x = event.x;
        d.y = event.y;
        this.graph.render();
    }

    handleDragend(event, d) {
        d.x = event.x;
        d.y = event.y;
        this.graph.render();
    }

}