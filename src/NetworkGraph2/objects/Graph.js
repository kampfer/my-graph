import Object from "./Object";

function getId(object) {
    return typeof object === 'string' ? object : object.id;
}

export default class Graph extends Object {

    type = 'graph'

    constructor(...args) {
        super(...args);

        this.transportUpdateNodeEvent = (e) => this.emit('updatenode', { type: 'updatenode', node: e.node });
        this.transportUpdateEdgeEvent = (e) => this.emit('updateedge', { type: 'updateedge', node: e.edge });
    }

    addNode(node) {
        super.addChild(node);
        node.on('update', this.transportUpdateNodeEvent);
    }

    getNodeById(id) {
        let node;
        this.traverse((child) => {
            if (node) return;
            if (child.type === 'node' && child.data.id === id) node = child;
        });
        return node;
    }

    getNodes() {
        return this.filterChild(d => d.type === 'node');
    }

    eachNode(callback) {
        this.traverse(child => {
            if (child.type === 'node') {
                callback(child);
            }
        });
    }

    addEdges(edges) {
        edges.forEach(edge => {
            super.prependChild(edge);
            edge.on('update', this.transportUpdateEdgeEvent);
        });
        this._updateEdges();
    }

    // 添加多条边的情况推荐使用addEdges。
    // 因为多次调用addEdge方法会多次调用_updateEdges，产生冗余计算。
    addEdge(edge) {
        super.prependChild(edge);
        edge.on('update', this.transportUpdateEdgeEvent);
        this._updateEdges();
    }

    getEdgesBySourceAndTarget(sourceId, targetId) {
        return this.filterChild(child =>
            child.type === 'edge' &&
            getId(child.data.source) === sourceId &&
            getId(child.data.target) === targetId
        );
    }

    getEdges() {
        return this.filterChild(d => d.type === 'edge');
    }

    eachEdge(callback) {
        this.traverse(child => {
            if (child.type === 'edge') {
                callback(child);
            }
        });
    }

    _updateEdges() {
        const edges = this.getEdges();
        const edgeMap = {};

        edges.forEach(edge => {
            const edgeData = edge.data;
            // 统计边信息
            const sourceId = getId(edgeData.source);
            const targetId = getId(edgeData.target);
            const direction = `${sourceId}-${targetId}`;
            const directionAlt = `${targetId}-${sourceId}`;
            if (edgeMap[direction] === undefined) edgeMap[direction] = 0;
            if (edgeMap[directionAlt] === undefined) edgeMap[directionAlt] = 0;
            // sameIndex需要同时考虑同向和反向边
            // 比如同向边数量为2、反向边数量为1，那么新的sameIndex应该是4
            if (direction === directionAlt) {
                edgeData.sameIndex = ++edgeMap[direction];
            } else {
                edgeData.sameIndex = ++edgeMap[direction] + edgeMap[directionAlt];
            }
        });

        edges.forEach((edge, i) => {
            const edgeData = edge.data;
            const sourceId = getId(edgeData.source);
            const targetId = getId(edgeData.target);
            const same = edgeMap[`${sourceId}-${targetId}`];
            const sameAlt = edgeMap[`${targetId}-${sourceId}`];

            edgeData.sameTotal = same + sameAlt;
            edgeData.sameTotalHalf = edgeData.sameTotal / 2;
            edgeData.sameUneven = edgeData.sameTotal % 2 !== 0;
            edgeData.sameMiddleLink = edgeData.sameUneven === true && Math.ceil(edgeData.sameTotalHalf) === edgeData.sameIndex;
            edgeData.sameLowerHalf = edgeData.sameIndex > edgeData.sameTotalHalf;
            edgeData.sameIndexCorrected = edgeData.sameLowerHalf ? (Math.ceil(edgeData.sameTotalHalf) - edgeData.sameIndex) : edgeData.sameIndex;
        });
    }

}
