import EventEmitter from 'eventemitter3';
import * as d3 from 'd3';

export default class DragControl extends EventEmitter {

    constructor(renderer, graph) {
        super();

        const updatePositionEndRender = function(event, d) {
            d.data.x = event.x;
            d.data.y = event.y;
            renderer.render(graph);
        };

        const d3Drag = d3.drag()
            .on('start', updatePositionEndRender)
            .on('drag', updatePositionEndRender)
            .on('end', updatePositionEndRender);

        d3.select(renderer.domElement())
            .selectAll('g.node')
                .call(d3Drag);
    }

}