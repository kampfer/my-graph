import EventEmitter from 'eventemitter3';
import * as d3 from 'd3';

export default class ZoomControl extends EventEmitter {

    constructor(rootElem, wrapperElem) {
        super();

        const selection = d3.select(wrapperElem);
        const { width, height } = rootElem.getBoundingClientRect();
        const d3Zoom = d3.zoom()
            .filter(event => !event.ctrlKey)
            .extent([[-width / 2, -height / 2], [width / 2, height / 2]])
            // .scaleExtent([1, 8])
            .on('zoom', event => {
                const { transform } = event;
                selection.attr('transform', transform);
                this.emit('zoom', event);
            })
            .on('start', event => this.emit('zoomstart', event))
            .on('end', event => this.emit('zoomend', event));

        d3.select(rootElem).call(d3Zoom);
        this.d3Zoom = d3Zoom;
    }

}