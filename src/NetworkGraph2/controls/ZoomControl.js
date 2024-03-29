import EventEmitter from 'eventemitter3';
import * as d3 from 'd3-zoom';

export default class ZoomControl extends EventEmitter {

    constructor(graph) {
        super();

        const handleZoomstart = (e, d) => {
            this.emit('zoomstart', e);
        };

        const handleZoomend = (e, d) => {
            this.emit('zoomend', e);
        };

        const rootSelection = graph.renderer.rootSelection;
        const wrapperSelection = rootSelection.select('g.canvas');
        const { width, height } = rootSelection.node().getBoundingClientRect();
        const d3Zoom = d3.zoom()
            .filter(event => !event.ctrlKey)
            .extent([[-width / 2, -height / 2], [width / 2, height / 2]])
            // .scaleExtent([1, 8])
            .on('zoom', event => {
                const { transform } = event;
                wrapperSelection.attr('transform', transform);
                this.emit('zoom', event);
            })
            .on('start', handleZoomstart)
            .on('end', handleZoomend);

        rootSelection.call(d3Zoom);
        this.d3Zoom = d3Zoom;
    }

}