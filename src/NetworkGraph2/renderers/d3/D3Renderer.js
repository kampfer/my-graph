import * as d3 from 'd3';

export default class D3Renderer {

    constructor({
        svg
    } = {}) {
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
        this._gSelection = this.rootSelection.append('g');
    }

    setViewBox(x, y, width, height) {
        this.rootSelection.attr('viewBox', [x, y, width, height]);
    }

    setSize(width, height) {
        this.rootSelection
            .attr('width', width)
            .attr('height', height);
    }

    domElement() {
        return this.rootSelection.node();
    }

    render(graph) {

        console.log('graph render');

        const nodes = graph.getNodes();
        const edges = graph.getEdges();
        const self = this;

        this._gSelection
            .selectAll('g.edge')
            .data(edges, d => d.data.id)
            .join(
                enter => enter.append('g')
                    .classed('edge', true)
                    .each(function(edge) {
                        console.log('create edge');
                        edge.view.create(edge.data, d3.select(this));
                    })
            )
            .each(function(edge) {
                console.log('update edge');
                edge.view.update(edge.data, d3.select(this));
            });

        this._gSelection
            .selectAll('g.node')
            .data(nodes, d => d.data.id)
            .join(
                enter => enter.append('g')
                    .classed('node', true)
                    .each(function(node) {
                        console.log('create node');
                        node.view.create(node.data, d3.select(this));
                    })
            )
            .each(function(node) {
                console.log('update node');
                node.view.update(node.data, d3.select(this));
            });

    }

}