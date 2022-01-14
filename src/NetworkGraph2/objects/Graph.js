import Object from "./Object";

function getId(object) {
    return typeof object === 'string' ? object : object.id;
}

export default class Graph extends Object {

    type = 'graph'

    constructor(...args) {
        super(...args);
        this._edgeMap = {};
    }

    addNode(...args) {
        super.addChild(...args);
    }

    getNodeById(id) {
        let node;
        this.traverse((child) => {
            if (node) return;
            if (child.type === 'node' && child.id === id) node = child;
        });
        return node;
    }

    getNodes() {
        return this.filterChild(d => d.type === 'node');
    }

    addEdge(edge) {
        return super.addChild(edge);
        // 统计边信息
        const sourceId = getId(edge.source);
        const targetId = getId(edge.target);
        const direction = `${sourceId}-${targetId}`;
        const directionAlt = `${targetId}-${sourceId}`;
        const edgeMap = this._edgeMap;
        if (edgeMap[direction] === undefined) edgeMap[direction] = 0;
        if (edgeMap[directionAlt] === undefined) edgeMap[directionAlt] = 0;
        // sameIndex需要同时考虑同向和反向边
        // 比如同向边数量为2、反向边数量为1，那么新的sameIndex应该是4
        if (direction === directionAlt) {
            edge.sameIndex = ++edgeMap[direction];
        } else {
            edge.sameIndex = ++edgeMap[direction] + edgeMap[directionAlt];
        }

        [
            ...this.getEdgesBySourceAndTarget(edge.source, edge.target),
            ...this.getEdgesBySourceAndTarget(edge.target, edge.source)
        ].forEach((edge) => {
            const sourceId = getId(edge.source);
            const targetId = getId(edge.target);
            const same = edgeMap[`${sourceId}-${targetId}`] || 0;
            const sameAlt = edgeMap[`${targetId}-${sourceId}`] || 0;

            edge.sameTotal = same + sameAlt;
            edge.sameTotalHalf = edge.sameTotal / 2;
            edge.sameUneven = edge.sameTotal % 2 !== 0;
            edge.sameMiddleLink = edge.sameUneven === true && Math.ceil(edge.sameTotalHalf) === edge.sameIndex;
            edge.sameLowerHalf = edge.sameIndex > edge.sameTotalHalf;
            edge.sameIndexCorrected = edge.sameLowerHalf ? (Math.ceil(edge.sameTotalHalf) - edge.sameIndex) : edge.sameIndex;
        })
    }

    getEdgesBySourceAndTarget(sourceId, targetId) {
        return this.filterChild(d => 
            d.type === 'edge' && 
            getId(d.source) === sourceId &&
            getId(d.target) === targetId
        );
    }

    getEdges() {
        return this.filterChild(d => d.type === 'edge');
    }

}
