import EventEmitter from 'eventemitter3';

export default class ClickSelectControl extends EventEmitter {

    constructor(graph) {
        super();

        const handleClickElement = function (e, elem) {
            e.stopPropagation();

            let hitElem;
            graph.model.traverse(child => {
                const hit = child.data.id === elem.data.id;
                child.data.selected = hit;
                if (hit) {
                    hitElem = child;
                }
            })

            if (hitElem) {
                if (hitElem.type === 'node') {
                    graph.model.emit('selectNode', { type: 'selectNode', target: hitElem });
                } else if (hitElem.type === 'edge') {
                    graph.model.emit('selectEdge', { type: 'selectEdge', target: hitElem });
                }
                graph.render();
            }
        };

        graph.renderer.on('createdNode', enter => enter.on('click', handleClickElement));
        graph.renderer.on('createdEdge', enter => enter.on('click', handleClickElement));
        graph.renderer.rootSelection.on('click', (e) => {
            graph.model.traverse(child => {
                child.data.selected = false;
            });
            graph.renderer.render(graph.model);
            graph.model.emit('clearSelect', { type: 'clearSelect' });
        });
    }

}