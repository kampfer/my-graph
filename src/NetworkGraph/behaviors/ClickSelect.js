import Behavior from './Behavior';

export default class ClickSelectBehavior extends Behavior {

    constructor(...args) {
        super(...args);
        this.events = {
            'click.node': this.handleClick.bind(this)
        };
    }

    handleClick(e, d) {
        const ids = [d.id];
        this.graph.selectNodes(ids);
        this.emit('selectChange.node', ids);
    }

}