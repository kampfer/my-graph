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
        if (!event.active) this.graph.forceSimulation.alphaTarget(0.3).restart();   // 重新激活force tick
        d.fx = d.x;
        d.fy = d.y;
    }

    handleDrag(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    handleDragend(event, d) {
        if (!event.active) this.graph.forceSimulation.alphaTarget(0);   // 动画可以停止
        d.fx = null;
        d.fy = null;
    }

}