import Behavior from './Behavior';

export default class ClickSelectBehavior extends Behavior {

    constructor(...args) {
        super(...args);
        this.events = {
            'click.node': this.handleClick.bind(this),
            'click.edge': this.handleCliatAtEdge.bind(this)
        };
    }

    handleClick(e, d) {
        const ids = [d.id];
        this.graph.selectNodes(ids);
        this.graph.emit('selectChange.node', ids, d);
    }

    handleCliatAtEdge(e, d) {
        const ids = [d.id];
        this.graph.selectEdges(ids);
        this.graph.emit('selectChange.edge', ids, d);
    }

}