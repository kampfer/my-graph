import * as d3 from 'd3';
import node from './node';
import edge from './edge';

export default class D3Renderer {

    constructor({
        svg,
        elementDefines = [
            node,
            edge
        ]
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

        elementDefines.forEach(def => this.registerElement(def.type, def));
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

    registerElement(name, def) {
        if (!this._elemDefs) this._elemDefs = {};
        if (this._elemDefs[name]) return;
        this._elemDefs[name] = def;
    }

    unregisterElement(name) {
        if (this._elemDefs) delete this._elemDefs[name];
    }

    getElementDef(name) {
        const def = this._elemDefs ? this._elemDefs[name] : null;
        if (def) return def;
        return null;
    }

    render(graph) {

        console.log('graph render');

        const nodes = graph.getNodes();
        const edges = graph.getEdges();
        const self = this;

        this._gSelection
            .selectAll('g.edge')
            .data(edges, d => d.id)
            .join(
                enter => enter.append('g')
                    .classed('edge', true)
                    .each(function(d) {
                        const def = self.getElementDef(d.type);
                        def.create(d, d3.select(this), self);
                    })
            )
            .each(function(d) {
                const def = self.getElementDef(d.type);
                def.update(d, d3.select(this), self);
            });

        this._gSelection
            .selectAll('g.node')
            .data(nodes, d => d.id)
            .join(
                enter => enter.append('g')
                    .classed('node', true)
                    .each(function(d) {
                        const def = self.getElementDef(d.type);
                        def.create(d, d3.select(this), self);
                    })
            )
            .each(function(d) {
                const def = self.getElementDef(d.type);
                def.update(d, d3.select(this), self);
            });

    }

}