import Object from "./Object";

export default class Graph extends Object {

    type = 'graph'

    constructor(...args) {
        super(...args);
    }

    getNodes() {
        return this.filterChild(d => d.type === 'node');
    }

    getEdges() {
        return this.filterChild(d => d.type === 'edge');
    }

}
