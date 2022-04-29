import EventEmitter from 'eventemitter3';
import * as d3 from 'd3-selection';

export default class D3Renderer extends EventEmitter {

    constructor({
        svg
    } = {}) {
        super();

        if (svg && svg instanceof SVGElement) {
            this.rootSelection = d3.select(svg);
        } else {
            this.rootSelection = d3.create('svg');
        }

        this.rootSelection
            .classed('network-graph', true)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        this.rootSelection.append('defs');
        // 元素需要用容器包裹住，这样才方便使用d3.zoom
        this._gSelection = this.rootSelection
            .append('g')
            .classed('canvas', true);
    }

    setViewBox(x, y, width, height) {
        this.rootSelection.attr('viewBox', [x, y, width, height]);
    }

    setSize(width, height) {
        this.rootSelection
            .attr('width', width)
            .attr('height', height);
    }

    rootElement() {
        return this.rootSelection.node();
    }

    renderElement(element, parentSelection) {
        const elemSelection = element.view.create(element.data, parentSelection);
        this.emit('renderElement', elemSelection);
        if (element.children) {
            element.children.forEach(
                child => this.renderElement(child.data, elemSelection)
            );
        }
    }

    renderChildren(children, parentSelection) {
        const self = this;
        parentSelection.selectAll('g.element')
            .data(children, d => d.data.id)
            .join(
                enter => enter.append('g')
                    .classed('element', true)
                    .each(function(elem) {
                        const elemSelection = d3.select(this);
                        elem.view.create(elem.data, elemSelection);
                        self.emit('renderElement', elemSelection);
                        // 现阶段node和edge都没有children，等添加group类型后就需要递归添加child
                        if (elem.children) self.renderChildren(elem.children(), elemSelection);
                    })
            )
            .each(function(elem) {
                if(elem.dirty) {
                    elem.view.update(elem.data, d3.select(this));
                    elem.dirty = false;
                }
            });
    }

    render(graph) {
        // console.log('graph render');

        // graph.traverse((elem) => console.log(elem));

        // graph.eachChild(child => this.renderElement(child, this._gSelection));

        this.renderChildren(graph.children(), this._gSelection);

        // const nodes = graph.getNodes();
        // const edges = graph.getEdges();

        // this._gSelection
        //     .selectAll('g.edge')
        //     .data(edges, d => d.data.id)
        //     .join(
        //         enter => enter.append('g')
        //             .classed('edge', true)
        //             .each(function(edge) {
        //                 // console.log('create edge');
        //                 edge.view.create(edge.data, d3.select(this));
        //             })
        //             .call((enter) => {
        //                 this.emit('createdEdge', enter);
        //             })
        //     )
        //     .each(function(edge) {
        //         // console.log('update edge');
        //         edge.view.update(edge.data, d3.select(this));
        //     });

        // this._gSelection
        //     .selectAll('g.node')
        //     .data(nodes, d => d.data.id)
        //     .join(
        //         enter => enter.append('g')
        //             .classed('node', true)
        //             .each(function(node) {
        //                 // console.log('create node');
        //                 node.view.create(node.data, d3.select(this));
        //             })
        //             .call((enter) => {
        //                 this.emit('createdNode', enter);
        //             })
        //     )
        //     .each(function(node) {
        //         // console.log('update node');
        //         node.view.update(node.data, d3.select(this));
        //     });

    }

}