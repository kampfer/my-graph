import EventEmitter from 'eventemitter3';

export default class ClickSelectControl extends EventEmitter {

    constructor(graph) {
        super();

        const handleClick = function (e, node) {
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

        graph.renderer.on('createdNode', enter => enter.on('click', handleClick));
        graph.renderer.rootSelection.on('click', (e) => {
            graph.model.eachNode(child => {
                child.data.selected = false;
                child.data.color = '#000';
                child.data.size = 15;
            });
            graph.renderer.render(graph.model);
            graph.model.emit('clearSelect', { type: 'clearSelect' });
        });
    }

}