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
                    child.data.color = '#99f';
                    if (child.type === 'node') {
                        child.data.size = 20;
                    } else if (child.type === 'edge') {
                        //
                    }
                } else {
                    child.data.color = '#000';
                    if (child.type === 'node') {
                        child.data.size = 15;
                    }
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