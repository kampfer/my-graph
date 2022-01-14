import * as d3 from 'd3';
import EventEmitter from 'eventemitter3';
// import * as math from './math.js';
import DragDropBehavior from './behaviors/DragDrop';
import ClickSelectBehavior from './behaviors/ClickSelect';
import ZoomBehavior from './behaviors/Zoom';
import Behavior from './behaviors/Behavior';
import ForceLayout from './layouts/ForceLayout';
import edge from './edges/edge';

import defaultStyle from './style';

export default class NetworkGraph extends EventEmitter {

    static registerNode(nodeType, config) {
        if (!NetworkGraph.nodeConstrutors) NetworkGraph.nodeConstrutors = {};
        NetworkGraph.nodeConstrutors[nodeType] = config;
    }

    static registerEdge(edgeType, config) {
        if (!NetworkGraph.edgeConstructors) NetworkGraph.edgeConstructors = {};
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
        if (!NetworkGraph.behaviors) NetworkGraph.behaviors = {};
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
        layout = ForceLayout,
        style = ''
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
        this.svgSelection
            .classed('network-graph', true)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
            .append('style')
            .attr('type', 'text/css')
            .text(defaultStyle + style);

        // d3 selection
        this.defsSelection = this.svgSelection.append('defs');
        this.gSelection = this.svgSelection.append('g');
        this.nodeSelection = null;
        this.edgeSelection = null;
        this.edgePathSelection = null;

        this.setViewBox(-width / 2, -height / 2, width, height);

        this.layout = new layout(this);

        this._d3Drag = d3.drag()
            .on('start', this._transportEvent('dragstart.node'))
            .on('drag', this._transportEvent('drag.node'))
            .on('end', this._transportEvent('dragend.node'));

        this._d3Zoom = d3.zoom()
            .filter(event => !event.ctrlKey)
            .extent([[-width / 2, -height / 2], [width / 2, height / 2]])
            // .scaleExtent([1, 8])
            .on('zoom', this._transportEvent('zoom'))
            .on('start', this._transportEvent('zoomstart'))
            .on('end', this._transportEvent('zoomend'));
        this.svgSelection.call(this._d3Zoom);

        this.svgSelection.on('mousemove', this._transportEvent('mousemove.canvas'));
        this.svgSelection.on('mousedown', this._transportEvent('mousedown.canvas'));
        this.svgSelection.on('click', this._transportEvent('click.canvas'));
        this.svgSelection.on('contextmenu', this._transportEvent('contextmenu.canvas'));

        this.useBehaviors(behaviors);

    }

    setViewBox(left, top, width, height) {
        this.svgSelection.attr('viewBox', [left, top, width, height])
            .attr('width', width)
            .attr('height', height);
    }

    data(data) {
        this._data = data;

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
            if (direction === directionAlt) {
                edge.sameIndex = ++sames[direction];
            } else {
                edge.sameIndex = ++sames[direction] + sames[directionAlt];
            }
            
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

    render({
        autoLayout = false
    } = {}) {

        console.log('render');

        // 做动画时每次都会调用render，每次调用render就setData是否影响性能？
        // 是否有必要每次都setData？
        // const { nodes, edges } = this.setData(data);
        const { nodes, edges } = this._data;

        this.gSelection.selectAll('g.edge-group')
            .data(edges, d => d.id)
            .join(
                enter => this._createEdges(enter),
                update => this._updateEdges(update),
            );

        // 节点
        this.gSelection.selectAll('g.node-group')
            // 必须给key，否则改变元素顺序时，展示会错乱
            .data(nodes, d => d.id)
            .join(
                enter => this._createNodes(enter),
                update => this._updateNodes(update),
            );

        this.edgeSelection = this.gSelection.selectAll('g.edge-group');
        this.nodeSelection = this.gSelection.selectAll('g.node-group');
        this.edgeLabelSelection = this.gSelection.selectAll('text.edge-label');

        const selectedNodes = this.nodeSelection.filter(d => d.selected);
        const selectedEdges = this.edgeSelection.filter(d => d.selected);

        this.gSelection.classed('hasSelected', selectedNodes.size() > 0 || selectedEdges.size() > 0);

        // 选中的元素放在最后，这样展示时会在最上层
        selectedEdges.raise();
        this.edgeLabelSelection.filter(d => d.selected).raise();
        selectedNodes.raise();

        // this.layout.data(this._data);
        // if (autoLayout) {
        //     this.layout.start();
        // }

    }

    selectNodes(ids) {
        const { nodes } = this._data;
        for(let node of nodes) {
            if (ids.includes(node.id)) {
                node.selected = true;
            } else {
                node.selected = false;
            }
        }
        this.render(this._data);
    }

    selectEdges(ids) {
        const { edges } = this._data;
        for(let edge of edges) {
            const flag = ids.includes(edge.id);
            edge.selected = flag;
        }
        this.render(this._data);
    }

    clearSelect() {
        const { nodes, edges } = this._data;
        for(let node of nodes) {
            node.selected = false;
        }
        for(let edge of edges) {
            edge.selected = false;
        }
        this.render(this._data);
    }

    toggleEdge(flag) {
        if (typeof flag === 'boolean') {
            this._displayEdge = flag;
        } else {
            this._displayEdge = !this._displayEdge;
        }
        this.gSelection.classed('no-edge', !this._displayEdge);
    }

    toggleEdgeLabel(flag) {
        if (typeof flag === 'boolean') {
            this._displayEdgeLabel = flag;
        } else {
            this._displayEdgeLabel = !this._displayEdgeLabel;
        }
        this.gSelection.classed('no-edge-label', !this._displayEdgeLabel);
    }

    // BUG: 布局停止后隐藏箭头，会导致边计算错误
    toggleEdgeDirection(flag) {
        if (typeof flag === 'boolean') {
            this._displayEdgeDirection = flag;
        } else {
            this._displayEdgeDirection = !this._displayEdgeDirection;
        }
        this.gSelection.classed('no-edge-direction', !this._displayEdgeDirection);
        this.render(this._data);
    }

    toggleNodeLabel(flag) {
        if (typeof flag === 'boolean') {
            this._displayNodeLabel = flag;
        } else {
            this._displayNodeLabel = !this._displayNodeLabel;
        }
        this.gSelection.classed('no-node-label', !this._displayNodeLabel);
    }

    useBehavior(behaviorName) {
        const BehaviorConstructor = NetworkGraph.getBehavior(behaviorName);
        if (!BehaviorConstructor) return;

        if (!this._behaviors) this._behaviors = {};

        const behavior = new BehaviorConstructor(this);
        this._behaviors[behaviorName] = behavior;
        behavior.use();
    }

    unuseBehavior(behaviorName) {
        if (!this._behaviors) return;
        const behavior = this._behaviors[behaviorName];
        if (behavior) behavior.destroy();
    }

    useBehaviors(behaviors) {
        behaviors.forEach(behaviorName => this.useBehavior(behaviorName));
    }

    unuseBehaviors(behaviors) {
        behaviors.forEach(behaviorName => this.unuseBehavior(behaviorName));
    }

    addNode(node) {
        this._data.nodes.push(node);
        this.render(this._data);
    }

    removeNode(node) {
        const index = this._data.nodes.indexOf(node);
        this._data.nodes.splice(index, 1);
        this.render(this._data);
    }

    findNode(fn) {
        return this._data.nodes.filter(fn);
    }

    addEdge(edge) {
        this._data.edges.push(edge);
        this.render(this._data);
    }

    removeEdge(edge) {
        const index = this._data.edges.indexOf(edge);
        this._data.edges.splice(index, 1);
        this.render(this._data);
    }

    findEdge(fn) {
        return this._data.edges.filter(fn);
    }

    toSVG() {
        const {x, y, width, height} = this.gSelection.node().getBBox();
        const newNode = this.svgSelection.node().cloneNode(true);
        newNode.setAttribute('viewBox', `${x}, ${y}, ${width}, ${height}`);
        newNode.setAttribute('width', width);
        newNode.setAttribute('height', height);
        return {
            width,
            height,
            content: newNode.outerHTML,
        }
    }

    toDataURL(type, encoderOptions) {}

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
        nodeSelection.on('contextmenu', this._transportEvent('contextmenu.node'));

        nodeSelection.attr('id', d => d.id)
            .classed('node-group', true)
            .call(this._d3Drag);

        return nodeSelection;
    }

    _updateNodes(nodeSelection, graph) {
        // 这里对每个节点单独执行更新操作
        // TODO: 先筛选出每类节点，然后批量更新每类节点，会不会更快？
        nodeSelection.each(function(d, i, nodes) {
            console.log('node update');
            const constructor = NetworkGraph.getNodeConstructor(d.type);
            const selection = d3.select(this);
            constructor.update(selection, d, graph);
        });

        nodeSelection.classed('selected', d => d.selected)
            .classed('activated', d => d.activated)
            .classed('hidden', d => d.visible === false);

        return nodeSelection;
    }

    _createEdges(enter) {
        const edgeSelection = enter.append(d => {
            const constructor = NetworkGraph.getEdgeConstructor(d.type);
            const selection = constructor.create(d, this);
            return selection.node();
        });

        edgeSelection.on('click', this._transportEvent('click.edge'));
        edgeSelection.on('contextmenu', this._transportEvent('contextmenu.edge'));
        
        return edgeSelection;
    }

    _updateEdges(edgeSelection, graph) {
        edgeSelection.each(function(d) {
            console.log('edge update');
            const constructor = NetworkGraph.getEdgeConstructor(d.type);
            const selection = d3.select(this);
            constructor.update(selection, d, graph);
        });

        edgeSelection.classed('selected', d => d.selected)
            .classed('activated', d => d.activated)
            .classed('hidden', d => d.visible === false);

        return edgeSelection;
    }

    _transportEvent(eventName) {
        if (!this._transportedEvents) this._transportedEvents = {};
        if (!this._transportedEvents[eventName]) {
            this._transportedEvents[eventName] = (e, d) => {
                this.emit(eventName, e, d);
            }
        }
        return this._transportedEvents[eventName];
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

            this.update(groupSelection, datum, graph);

            return groupSelection;
        },
        update(selection, datum, graph) {
            selection.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
        }
    }
};

NetworkGraph.registerEdge('default', edge);

NetworkGraph.registerBehavior('dragDrop', DragDropBehavior);
NetworkGraph.registerBehavior('clickSelect', ClickSelectBehavior);
NetworkGraph.registerBehavior('zoom', ZoomBehavior);

NetworkGraph.Behavior = Behavior;
