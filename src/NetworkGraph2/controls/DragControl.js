import EventEmitter from 'eventemitter3';
import * as d3 from 'd3-drag';

export default class DragControl extends EventEmitter {

    constructor(graph) {
        super();

        // 记录鼠标相对于节点origin的相对距离
        // 每次更新节点位置时需要额外加上相对距离
        // 这样才能保证开始拖动节点时不发生抖动，鼠标位置相对节点的位置正确无误
        let deltaX, deltaY;
        const recordPosition = function (event, d) {
            deltaX = d.data.x - event.x;
            deltaY = d.data.y - event.y;
        };

        const updatePositionEndRender = function(event, d) {
            // 更新node
            d.data.x = event.x + deltaX;
            d.data.y = event.y + deltaY;
            // 所有与node连接的边也需要更新
            graph.model.traverse(elem => {
                if (elem.type === 'edge') {
                    if (elem.data.source.id === d.data.id) {
                        elem.dirty = true;
                    }
                    if (elem.data.target.id === d.data.id) {
                        elem.dirty = true;
                    }
                }
            })
            graph.renderer.render(graph.model);
        };

        const d3Drag = d3.drag()
            .on('start', recordPosition)
            .on('drag', updatePositionEndRender)
            .on('end', updatePositionEndRender);

        graph.renderer.on('renderElement', (enter) => {
            if (enter.datum().type === 'node') enter.call(d3Drag);
        });
    }

}