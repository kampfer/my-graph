import * as d3 from 'd3';

export default class D3Renderer {

    constructor({
        svg
    } = {}) {
        if (svg && svg instanceof SVGElement) {
            this._svgSelection = d3.select(svg);
        } else {
            this._svgSelection = d3.create('svg');
        }

        this._svgSelection
            .classed('network-graph', true)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        this._gSelection = this._svgSelection.append('g');
    }

    setViewBox(x, y, width, height) {
        this._svgSelection.attr('viewBox', [x, y, width, height]);
    }

    setSize(width, height) {
        this._svgSelection
            .attr('width', width)
            .attr('height', height);
    }

    domElement() {
        return this._svgSelection.node();
    }

    render(graph) {

        console.log('graph render');

        const nodes = graph.getNodes();
        const edges = graph.getEdges();

        this._gSelection
            .selectAll('g.edge')
            .data(edges, d => d.id)
            .join(enter => enter.append('g').classed('edge', true))
            .each(function(d) {
                const selection = d3.select(this);
                d.render(selection);
            });

        this._gSelection
            .selectAll('g.node')
            .data(nodes, d => d.id)
            .join(enter => enter.append('g').classed('node', true))
            .each(function(d) {
                console.log('graph node render');
                const selection = d3.select(this);
                d.render(selection);
            });

    }

}