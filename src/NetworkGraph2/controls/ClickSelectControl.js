import EventEmitter from 'eventemitter3';

export default class ClickSelectControl extends EventEmitter {

    constructor(graph) {
        super();

        const handleClick = function (e, node) {
            graph.model.eachNode(child => {
                const hit = child.data.id === node.data.id;
                child.data.selected = hit;
                if (hit) {
                    child.data.color = '#99f';
                    child.data.size = 20;
                } else {
                    child.data.color = '#000';
                    child.data.size = 15;
                }
            });
            graph.renderer.render(graph.model);
        };

        graph.renderer.on('created.node', enter => {
            enter.on('click', handleClick);
        })
    }

}