import * as d3 from 'd3';
import EventEmitter from 'eventemitter3';
import * as math from './math.js';

import './graph.css';

export default class NetworkGraph extends EventEmitter {

    static registerNode(nodeType, config) {
        NetworkGraph.nodeConstrutors[nodeType] = config;
    }

    static registerEdge(edgeType, config) {
        NetworkGraph.edgeConstructors[edgeType] = config;
    }

    static getNodeConstructor(nodeType) {
        const constructor = NetworkGraph.nodeConstrutors[nodeType];
        if (constructor) return constructor;
        return NetworkGraph.nodeConstrutors.default;
    }

    static getEdgeConstructor(edgeType) {
        const constructor = NetworkGraph.edgeConstructors[edgeType];
        if (constructor) return constructor;
        return NetworkGraph.edgeConstructors.default;
    }

    static registerBehavior(behaviorName, behavior) {
        NetworkGraph.behaviors[behaviorName] = behavior;
    }

    static getBehavior(behaviorName) {
        return NetworkGraph.behaviors[behaviorName];
    }

    constructor({
        container,
        width = 300,
        height = 150,
        behaviors = [],
    } = {}) {

        super();

        // ui状态
        this._displayNodeLabel = true;
        this._displayEdge = true;
        this._displayEdgeLabel = true;
        this._displayEdgeDirection = true;

        if (container) {
            this.svgSelection = d3.select(container).append('svg');
        } else {
            this.svgSelection = d3.create('svg');
        }
        this.svgSelection.classed('network-graph', true);

        // d3 selection
        this.defsSelection = this.svgSelection.append('defs');
        this.gSelection = this.svgSelection.append('g');
        this.nodeSelection = null;
        this.edgeSelection = null;
        this.edgePathSelection = null;

        this.setViewBox(-width / 2, -height / 2, width, height);

        const simulation = d3.forceSimulation();
        const linkForce = d3.forceLink().id(d => d.id).distance(200);

        simulation.stop();

        simulation.force('edge', linkForce)
            .force('change', d3.forceManyBody().strength(-500))
            .force('x', d3.forceX().strength(0.05))
            .force('y', d3.forceY().strength(0.05));

        const handleTick = () => {

            if (this.edgeSelection && this._displayEdge) {
                this.edgeSelection.call(this._updateEdges, this);
            }

            if (this.nodeSelection) {
                this.nodeSelection.call(this._updateNodes, this);
            }

        };

        simulation.on('tick', handleTick);

        // 力导布局
        this.forceSimulation = simulation;
        this.linkForce = linkForce;

        this._d3Drag = d3.drag()
            .on('start', this._transportEvent('dragstart.node'))
            .on('drag', this._transportEvent('drag.node'))
            .on('end', this._transportEvent('dragend.node'));

        this._d3Zoom = d3.zoom()
            .filter(event => !event.ctrlKey)
            .extent([[-width / 2, -height / 2], [width / 2, height / 2]])
            // .scaleExtent([1, 8])
            .on('zoom', this._transportEvent('zoom'));
        this.svgSelection.call(this._d3Zoom);

        this.useBehaviors(behaviors);

    }

    setViewBox(left, top, width, height) {
        this.svgSelection.attr('viewBox', [left, top, width, height])
            .attr('width', width)
            .attr('height', height);
    }

    setData(data) {
        this.data = data;

        const { edges, nodes } = data;
        const sames = {};

        // 在最后添加假数据占位，避免调用d3.raise时移动了最后一个元素，导致d3.order不工作，边盖在点上
        if (!this.fakeDataAppended) {
            this.fakeDataAppended = true;
            edges.push({
                source: '__fake_source__',
                target: '__fake_target__',
                visible: false,
            });

            nodes.push({
                id: '__fake_source__',
                visible: false
            }, {
                id: '__fake_target__',
                visible: false
            });
        }

        edges.forEach(edge => {

            const sourceId = this._getSourceId(edge);
            const targetId = this._getTargetId(edge);
            const direction = `${sourceId}-${targetId}`;
            const directionAlt = `${targetId}-${sourceId}`;
            if (sames[direction] === undefined) sames[direction] = 0;
            if (sames[directionAlt] === undefined) sames[directionAlt] = 0;
            // sameIndex需要同时考虑同向和反向边
            // 比如同向边数量为2、反向边数量为1，那么新的sameIndex应该是4
            edge.sameIndex = ++sames[direction] + sames[directionAlt];

        });

        edges.forEach((edge, i) => {

            const sourceId = this._getSourceId(edge);
            const targetId = this._getTargetId(edge);
            const same = sames[`${sourceId}-${targetId}`] || 0;
            const sameAlt = sames[`${targetId}-${sourceId}`] || 0;

            edge.sameTotal = same + sameAlt;
            edge.sameTotalHalf = edge.sameTotal / 2;
            edge.sameUneven = edge.sameTotal % 2 !== 0;
            edge.sameMiddleLink = edge.sameUneven === true && Math.ceil(edge.sameTotalHalf) === edge.sameIndex;
            edge.sameLowerHalf = edge.sameIndex > edge.sameTotalHalf;
            edge.sameIndexCorrected = edge.sameLowerHalf ? (Math.ceil(edge.sameTotalHalf) - edge.sameIndex) : edge.sameIndex;

        });

        return data;
    }

    render(data, {
        restartForce = true
    } = {}) {

        console.log('render');

        const { nodes, edges } = this.setData(data);

        this.toggleEdgeLabel(edges.length <= 100);

        if (restartForce) this.forceSimulation.stop();

        this.forceSimulation.nodes(nodes);
        this.linkForce.links(edges);

        this.gSelection.selectAll('g.edge-group')
            .data(edges, d => d.id)
            .join(enter => this._createEdges(enter))
            .classed('selected', d => d.selected)
            .classed('activated', d => d.activated)
            .classed('hidden', d => d.visible === false);

        // 节点
        this.gSelection.selectAll('g.node-group')
            // 必须给key，否则改变元素顺序时，展示会错乱
            .data(nodes, d => d.id)
            .join(enter => this._createNodes(enter))
            .classed('selected', d => d.selected)
            .classed('activated', d => d.activated)
            .classed('hidden', d => d.visible === false);

        this.edgeSelection = this.gSelection.selectAll('g.edge-group');
        this.nodeSelection = this.gSelection.selectAll('g.node-group');
        this.edgeLabelSelection = this.gSelection.selectAll('text.edge-label');

        if (this.edgeSelection && this._displayEdge) this.edgeSelection.call(this._updateEdges, this);
        if (this.nodeSelection) this.nodeSelection.call(this._updateNodes, this);

        const selectedNodes = this.nodeSelection.filter(d => d.selected);
        const selectedEdges = this.edgeSelection.filter(d => d.selected);

        this.gSelection.classed('hasSelected', selectedNodes.size() > 0 || selectedEdges.size() > 0);

        // 选中的元素放在最后，这样展示时会在最上层
        selectedEdges.raise();
        this.edgeLabelSelection.filter(d => d.selected).raise();
        selectedNodes.raise();

        if (restartForce) {
            this.forceSimulation.alpha(1);
            this.forceSimulation.restart();
        }

    }

    rerender(...args) {
        this.render(this.data, ...args);
    }

    selectNodes(ids) {
        const { nodes } = this.data;
        for(let node of nodes) {
            if (ids.includes(node.id)) {
                node.selected = true;
            } else {
                node.selected = false;
            }
        }
        this.rerender({ restartForce: false });
    }

    selectEdges(ids) {
        const { edges } = this.data;
        for(let edge of edges) {
            const flag = ids.includes(edge.id);
            edge.selected = flag;
        }
        this.rerender({ restartForce: false });
    }

    clearSelect() {
        const { nodes, edges } = this.data;
        for(let node of nodes) {
            node.selected = false;
        }
        for(let edge of edges) {
            edge.selected = false;
        }
        this.rerender({ restartForce: false });
    }

    toggleEdge(flag) {
        if (typeof flag === 'boolean') {
            this._displayEdge = flag;
        } else {
            this._displayEdge = !this._displayEdge;
        }
        this.svgSelection.classed('no-edge', !this._displayEdge);
    }

    toggleEdgeLabel(flag) {
        if (typeof flag === 'boolean') {
            this._displayEdgeLabel = flag;
        } else {
            this._displayEdgeLabel = !this._displayEdgeLabel;
        }
        this.svgSelection.classed('no-edge-label', !this._displayEdgeLabel);
    }

    // BUG: 布局停止后隐藏箭头，会导致边计算错误
    toggleEdgeDirection(flag) {
        if (typeof flag === 'boolean') {
            this._displayEdgeDirection = flag;
        } else {
            this._displayEdgeDirection = !this._displayEdgeDirection;
        }
        this.svgSelection.classed('no-edge-direction', !this._displayEdgeDirection);
        this.rerender({ restartForce: false });
    }

    toggleNodeLabel(flag) {
        if (typeof flag === 'boolean') {
            this._displayNodeLabel = flag;
        } else {
            this._displayNodeLabel = !this._displayNodeLabel;
        }
        this.svgSelection.classed('no-node-label', !this._displayNodeLabel);
    }

    useBehavior(behaviorName) {
        const behavior = NetworkGraph.getBehavior(behaviorName);
        if (behavior) {
            const myBehavior = { events: behavior.events, graph: this };
            Object.entries(behavior.events)
                .forEach(([eventName, callbackName]) => {
                    const callback = behavior[callbackName].bind(myBehavior);
                    myBehavior[callbackName] = callback;
                    this.on(eventName, callback);
                });

            if (!this._behaviors) this._behaviors = {};
            this._behaviors[behaviorName] = myBehavior;
        }
    }

    unuseBehavior(behaviorName) {
        if (!this._behaviors) return;
        const behavior = this._behaviors[behaviorName];
        if (behavior) {
            Object.entries(behavior.events)
                .forEach(([eventName, callbackName]) => {
                    this.off(eventName, behavior[callbackName]);
                });
        }
    }

    useBehaviors(behaviors) {
        behaviors.forEach(behaviorName => this.useBehavior(behaviorName));
    }

    unuseBehaviors(behaviors) {
        behaviors.forEach(behaviorName => this.unuseBehavior(behaviorName));
    }

    addNode() {}

    removeNode() {}

    addEdge(edge) {
        this.data.edges.push(edge);
        this.rerender({ restartForce: false });
    }

    removeEdge() {}

    // 初始化时source是字符串，之后d3将它替换为对象
    _getSourceId(edge) {
        if (typeof edge.source === 'string') {
            return edge.source;
        } else {
            return edge.source.id;
        }
    }

    // 初始化时target是字符串，之后d3将它替换为对象
    _getTargetId(edge) {
        if (typeof edge.target === 'string') {
            return edge.target;
        } else {
            return edge.target.id;
        }
    }

    _createNodes(enter) {
        const nodeSelection = enter.append(d => {
            const constructor = NetworkGraph.getNodeConstructor(d.type);
            const selection = constructor.create(d, this);
            return selection.node();
        });

        nodeSelection.on('click', this._transportEvent('click.node'));
        nodeSelection.on('mouseenter', this._transportEvent('mouseenter.node'));
        nodeSelection.on('mouseleave', this._transportEvent('mouseleave.node'));

        nodeSelection.attr('id', d => d.id)
            .classed('node-group', true)
            .call(this._d3Drag);

        return nodeSelection;
    }

    _updateNodes(nodeSelection, graph) {
        // 这里对每个节点单独执行更新操作
        // TODO: 先筛选出每类节点，然后批量更新每类节点，会不会更快？
        nodeSelection.each(function(d, i, nodes) {
            const constructor = NetworkGraph.getNodeConstructor(d.type);
            const selection = d3.select(this);
            constructor.update(selection, d, graph);
        });
    }

    _createEdges(enter) {
        const edgeSelection = enter.append(d => {
            const constructor = NetworkGraph.getEdgeConstructor(d.type);
            const selection = constructor.create(d, this);
            return selection.node();
        });
        return edgeSelection;
    }

    _updateEdges(edgeSelection, graph) {
        edgeSelection.each(function(d) {
            const constructor = NetworkGraph.getEdgeConstructor(d.type);
            const selection = d3.select(this);
            constructor.update(selection, d, graph);
        });
    }

    _transportEvent(eventName) {
        return (e, d) => this.emit(eventName, e, d);
    }

}

NetworkGraph.nodeConstrutors = {
    default: {
        options: {
            size: 15,
            labelSize: 14
        },
        // TODO：create是否一定需要返回一个node，是否可以直接在svg添加标签？
        create(datum, graph) {
            // 必须手动绑定数据
            const groupSelection = d3.create('svg:g').datum(datum);
            const size = this.options.size;
            const labelSize = this.options.labelSize;

            groupSelection.append('circle')
                .classed('node', true)
                .attr('r', size);

            groupSelection.append('text')
                .text(datum.label)
                .attr('x', 0)
                .attr('y', size + labelSize)
                .style('font-size', labelSize)
                .attr('text-anchor', 'middle')
                .classed('node-label', true);

            return groupSelection;
        },
        update(selection, datum, graph) {
            selection.attr('transform', d => `translate(${d.x}, ${d.y})`);
        }
    }
};

NetworkGraph.edgeConstructors = {
    default: {
        getNodeSize(d) {
            if (d.size) return d.size;
            const constructor = NetworkGraph.getNodeConstructor(d.type);
            return constructor.options.size;
        },
        // TODO：create是否一定需要返回一个node，是否可以直接在svg添加标签？
        create(datum, graph) {
            const defsSelection = graph.defsSelection;
            const markerSelection = defsSelection.selectAll('marker.arrow');

            if (markerSelection.empty()) {
                markerSelection.data(['default', 'selected'])
                    .join('marker')
                    .attr('id', d => `arrow-${d}`)
                    .attr('class', d => `arrow ${d}`)
                    .attr('viewbox', '0 -5 10 10')
                    .attr('refX', 0)
                    .attr('refY', 0)
                    .attr('markerWidth', 6)
                    .attr('markerHeight', 6)
                    .attr('overflow', 'visible')
                    .attr('orient', 'auto-start-reverse')
                    .append('svg:path')
                    .attr('d', 'M 0,-5 L 10 ,0 L 0,5');
            }

            const g = d3.create('svg:g')
                .classed('edge-group', true)
                .datum(datum);

            g.append('svg:path')
                .attr('stroke', '#000')
                .classed('edge', true)
                .attr('id', `edge-${datum.id}`)
                .attr('fill', 'none');

            g.append('svg:text')
                .classed('edge-label', true)
                .classed('hidden', datum.visible === false)
                .append('textPath')
                .text(datum.label ? `关系：${datum.label}` : '')
                .attr('xlink:href', `#edge-${datum.id}`)
                .attr('text-anchor', 'middle')
                .attr('startOffset', '50%');

            return g;
        },
        update(selection, datum, graph) {
            const pathSelection = selection.select('path.edge');
            // 拖动点时保证箭头的指向正确
            const startMarker = pathSelection.attr('marker-start');
            if (datum.target.x < datum.source.x) {  // 反
                if ((!startMarker || startMarker === 'none')) {
                    pathSelection.attr('marker-start', `url(#arrow-${datum.selected ? 'selected' : 'default'}`);
                    pathSelection.attr('marker-end', 'none');
                }
            } else {    // 正
                if (!startMarker || startMarker !== 'none') {
                    pathSelection.attr('marker-start', 'none');
                    pathSelection.attr('marker-end', `url(#arrow-${datum.selected ? 'selected' : 'default'}`);
                }
            }
            if (!this._linkArc) this._linkArc = this.linkArc.bind(this, graph);
            pathSelection.attr('d', this._linkArc);
        },
        linkArc(graph, d) {
            // const r = 34;
            const arrowSize = graph._displayEdgeDirection ? 10 : 0;
            const delta = 15;
            const angle = 15;

            let sourceR = this.getNodeSize(d.source),
                targetR = this.getNodeSize(d.target),
                startX,
                startY,
                endX,
                endY,
                sourceX,
                sourceY,
                targetX,
                targetY;

            // 默认起点在左侧，终点在右侧。当拖动节点导致起点和终点位置反转时，计算path时需要反转起点和终点保证文字的朝向正常
            if (d.target.x < d.source.x) { // 反
                startX = d.target.x;
                startY = d.target.y;
                endX = d.source.x;
                endY = d.source.y;
                sourceR += arrowSize;
                // targetR = r;
            } else {    // 正
                startX = d.source.x;
                startY = d.source.y;
                endX = d.target.x;
                endY = d.target.y;
                // sourceR = r;
                targetR += arrowSize;
            }

            const intersectSourcePoints = math.getIntersectPointBetweenCircleAndLine(startX, startY, endX, endY, startX, startY, sourceR);
            if (math.onSegement([startX, startY], [endX, endY], intersectSourcePoints[0])) {
                sourceX = intersectSourcePoints[0][0];
                sourceY = intersectSourcePoints[0][1];
            } else {
                sourceX = intersectSourcePoints[1][0];
                sourceY = intersectSourcePoints[1][1];
            }

            const intersectTargetPoints = math.getIntersectPointBetweenCircleAndLine(startX, startY, endX, endY, endX, endY, targetR);
            if (math.onSegement([startX, startY], [endX, endY], intersectTargetPoints[0])) {
                targetX = intersectTargetPoints[0][0];
                targetY = intersectTargetPoints[0][1];
            } else {
                targetX = intersectTargetPoints[1][0];
                targetY = intersectTargetPoints[1][1];
            }

            if (d.sameTotal === 1 || d.sameMiddleLink) {
                return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
            } else {
                [sourceX, sourceY] = math.rotatePoint(sourceX, sourceY, startX, startY, -angle * d.sameIndexCorrected);
                [targetX, targetY] = math.rotatePoint(targetX, targetY, endX, endY, angle * d.sameIndexCorrected);

                const middlePoints = math.getMiddlePointOfBezierCurve(sourceX, sourceY, targetX, targetY, delta * d.sameIndexCorrected);
                let middlePoint;
                if (math.checkSameSide(startX, startY, endX, endY, sourceX, sourceY, ...middlePoints[0]) > 0) {
                    middlePoint = middlePoints[0];
                } else {
                    middlePoint = middlePoints[1];
                }

                const controlPoint = math.getControlPointOfBezierCurve([sourceX, sourceY], middlePoint, [targetX, targetY]);

                return `M ${sourceX} ${sourceY} Q ${controlPoint[0]} ${controlPoint[1]} ${targetX} ${targetY}`;
            }
        }
    }
};

NetworkGraph.behaviors = {
    'drag&drop': {
        events: {
            'dragstart.node': 'handleDragstart',
            'drag.node': 'handleDrag',
            'dragend.node': 'handleDragend'
        },
        handleDragstart(event, d) {
            if (!event.active) this.graph.forceSimulation.alphaTarget(0.3).restart();   // 重新激活force tick
            d.fx = d.x;
            d.fy = d.y;
        },
        handleDrag(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        },
        handleDragend(event, d) {
            if (!event.active) this.graph.forceSimulation.alphaTarget(0);   // 动画可以停止
            d.fx = null;
            d.fy = null;
        }
    },
    'clickSelect': {
        events: {
            'click.node': 'handleClick'
        },
        handleClick(e, d) {
            const ids = [d.id];
            this.graph.selectNodes(ids);
            this.emit('selectChange.node', ids);
        }
    },
    zoom: {
        events: {
            zoom: 'handleZoom'
        },
        handleZoom({ transform }) {
            this.graph.gSelection.attr('transform', transform)
        }
    }
};