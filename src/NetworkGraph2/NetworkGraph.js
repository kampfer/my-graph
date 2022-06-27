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

export default class NetworkGraph {
    
    constructor({
        container,
        width = 300,
        height = 150,
        data,
        layoutConfig,
        optimize = {
            enable: false,
            limit: 200
        }
    }) {
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

        this.placer = new ForceLayout(layoutConfig);
        this.dragControl = new DragControl(this);
        this.zoomControl = new ZoomControl(this);
        this.clickSelectControl = new ClickSelectControl(this);
        this.model = null;

        if (data) {
            this.data(data);
            this.layout();
            this.render();
        }

        this._optimize = false;
        if (optimize.enable) {
            this.enableOptimize(optimize);
        }
    }

    data(data) {
        this.model = new Graph();

        data.nodes.forEach(d => this.model.addNode(new Node(d, D3Node)));
        data.edges.forEach(d => this.model.addEdge(new Edge(d, D3Edge)));
    }

    layout(useStatic = true) {
        const placer = this.placer;
        
        placer.reset();
        // 这里直接引用元素data
        placer.data({
            nodes: this.model.getNodes().map(d => d.data),
            edges: this.model.getEdges().map(d => d.data)
        });

        if (useStatic) {
            while(placer.forceSimulation.alpha() > placer.forceSimulation.alphaMin()) {
                placer.forceSimulation.tick();
            }
        } else {
            placer.start();
        }
    }

    render() {
        this.renderer.render(this.model);
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

    enableOptimize({ limit }) {
        if (!this._optimize) {
            let needHideEdge = false;
            this._optimize = {
                limit,
                handle1: () => {
                    const edgeCount = this.model.getEdges().length;
                    if (edgeCount > this._optimize.limit) {
                        needHideEdge = true;
                        this.toggleAllEdges(false);
                    }
                },
                handle2: () => {
                    if (needHideEdge) {
                        needHideEdge = false;
                        this.toggleAllEdges(true);
                    }
                }
            };
        }

        this._optimize.limit = limit;
        
        if (!this._optimize.enable) {
            this.zoomControl.on('zoomstart', this._optimize.handle1);
            this.zoomControl.on('zoomend', this._optimize.handle2);
            this.dragControl.on('dragstart', this._optimize.handle1);
            this.dragControl.on('dragend', this._optimize.handle2);
            this._optimize.enable = true;
        }
    }

    disableOptimize() {
        this._optimize.enable = false;
        this.zoomControl.off('zoomstart', this._optimize.handle1);
        this.zoomControl.off('zoomend', this._optimize.handle2);
        this.dragControl.off('dragstart', this._optimize.handle1);
        this.dragControl.off('dragend', this._optimize.handle2);
    }

    destroy() {
        this.renderer.rootSelection.remove();
    }

}