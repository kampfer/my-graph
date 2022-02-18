import EventEmitter from 'eventemitter3';

export default class ClickSelectControl extends EventEmitter {

    constructor(graph) {
        super();

        const self = this;
        const handleClick = function (e, node) {
            node.data.selected = true;
            graph.renderer.render(graph.model);
            self.emit('select.node', node);
        };

        graph.renderer.on('created.node', enter => {
            enter.on('click', handleClick);
        })
    }

}