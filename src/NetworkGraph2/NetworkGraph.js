import EventEmitter from 'eventemitter3';
import D3Renderer from './renderers/d3/D3Renderer';
import Graph from './objects/Graph';
import Node from './objects/Node';
import Edge from './objects/Edge';
import ForceLayout from './layouts/ForceLayout';
import D3Edge from './views/d3/Edge';
import D3Node from './views/d3/Node';
import DragControl from './controls/DragControl';
import ZoomControl from './controls/ZoomControl';
import ClickSelectControl from './controls/ClickSelectControl';

export default class NetworkGraph extends EventEmitter {
    
    constructor({
        container,
        width = 300,
        height = 150,
        data
    }) {
        super();

        this.renderer = new D3Renderer();
        this.renderer.setSize(width, height);
        this.renderer.setViewBox(-width / 2, -height / 2, width, height);

        if (container) {
            if (typeof container === 'string') {
                document.querySelector(container).appendChild(this.renderer.rootElement());
            } else {
                container.appendChild(this.renderer.rootElement());
            }
        }

        this.layout = new ForceLayout();
        this.dragControl = new DragControl(this);
        this.zoomControl = new ZoomControl(this);
        this.clickSelectControl = new ClickSelectControl(this);
        this.model = null;

        if (data) {
            this.data(data);
            this.render();
        }
    }

    data(data) {
        this.model = new Graph();
        data.nodes.forEach(d => this.model.addNode(new Node(d, D3Node)));
        data.edges.forEach(d => this.model.addEdge(new Edge(d, D3Edge)));

        this.layout.data({
            nodes: this.model.getNodes().map(d => d.data),
            edges: this.model.getEdges().map(d => d.data)
        });
    }

    render() {
        const layout = this.layout;

        layout.reset();
        if (true) {
            while(layout.forceSimulation.alpha() > layout.forceSimulation.alphaMin()) {
                layout.forceSimulation.tick();
            }
            this.renderer.render(this.model);
        } else {
            layout.on('tick', () => this.renderer.render(this.model));
            layout.start();
        }
    }

    toggleAllNodes(flag) {
        this.model.getNodes().forEach(node => node.data.hidden = !flag);
        this.renderer.render(this.model);
    }

    toggleAllNodeLabels(flag) {
        this.model.getNodes().forEach(node => node.data.hideLabel = !flag);
        this.renderer.render(this.model);
    }

    toggleAllEdges(flag) {
        this.model.getEdges().forEach(edge => edge.data.hidden = !flag);
        this.renderer.render(this.model);
    }

    toggleAllEdgeLabels(flag) {
        this.model.getEdges().forEach(edge => edge.data.hideLabel = !flag);
        this.renderer.render(this.model);
    }

    destroy() {
        this.renderer.rootSelection.remove();
    }

}