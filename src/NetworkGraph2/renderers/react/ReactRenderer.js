export default class ReactRenderer {

    constructor() {
        this._domElement = document.createElement('svg');
    }

    domElement() {
        return this._domElement;
    }

    render(graph) {
        const domElement = this.domElement();
        const nodes = graph.getNodes();
        const edges = graph.getEdges();
        ReactDOM.render(
            <>
                { nodes.map(node => node.render()) }
                { edges.map(edge => edge.render()) }
            </>,
            domElement
        );
    }

}