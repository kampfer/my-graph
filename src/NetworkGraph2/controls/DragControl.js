import EventEmitter from 'eventemitter3';
import * as d3 from 'd3';

export default class DragControl extends EventEmitter {

    constructor(graph) {
        super();

        const updatePositionEndRender = function(event, d) {
            d.data.x = event.x;
            d.data.y = event.y;
            graph.renderer.render(graph.model);
        };

        const d3Drag = d3.drag()
            .on('start', updatePositionEndRender)
            .on('drag', updatePositionEndRender)
            .on('end', updatePositionEndRender);

        graph.renderer.on('createdNode', (enter) => enter.call(d3Drag));
    }

}