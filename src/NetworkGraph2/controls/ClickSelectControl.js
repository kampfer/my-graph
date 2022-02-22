import EventEmitter from 'eventemitter3';

export default class ClickSelectControl extends EventEmitter {

    constructor(graph) {
        super();

        const handleClickNode = function (e, node) {
            e.stopPropagation();
            graph.model.eachNode(child => {
                const hit = child.data.id === node.data.id;
                child.data.selected = hit;
                if (hit) {
                    child.data.color = '#99f';
                    child.data.size = 20;
                    graph.model.emit('selectNode', { type: 'selectNode', target: child });
                } else {
                    child.data.color = '#000';
                    child.data.size = 15;
                }
            });
            graph.renderer.render(graph.model);
        };

        const handleClickEdge = function (e, edge) {
            e.stopPropagation();
            graph.model.eachEdge(child => {
                const hit = child.data.id === edge.data.id;
                child.data.selected = hit;
                if (hit) {
                    child.data.color = '#99f';
                    graph.model.emit('selectEdge', { type: 'selectEdge', target: child });
                } else {
                    child.data.color = '#000';
                }
            });
            graph.renderer.render(graph.model);
        };

        graph.renderer.on('createdNode', enter => enter.on('click', handleClickNode));
        graph.renderer.on('createdEdge', enter => enter.on('click', handleClickEdge));
        graph.renderer.rootSelection.on('click', (e) => {
            graph.model.traverse(child => {
                child.data.selected = false;
                if (child.type === 'node') {
                    child.data.color = '#000';
                    child.data.size = 15;
                } else {
                    child.data.color = '#000';
                }
            });
            graph.renderer.render(graph.model);
            graph.model.emit('clearSelect', { type: 'clearSelect' });
        });
    }

}