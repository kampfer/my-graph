import * as d3 from 'd3';

export default class Node {

    type = 'node'

    constructor({
        id,
        x = 0,
        y = 0,
        label = ''
    } = {}, view) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.label = label;
        
        this.view = view;
    }

    render(selection) {
        let circleSelection, textSelection;
        if (!selection) {
            selection = d3.create('svg:g').datum(this);
            circleSelection = selection.append('circle');
            textSelection = selection.append('text');
        } else {
            circleSelection =  selection.select('circle');
            textSelection = selection.select('text');
        }

        const size = 15;
        const labelSize = 14;
        circleSelection
            .attr('r', size);
        textSelection
            .text(label)
            .attr('x', 0)
            .attr('y', size + labelSize)
            .style('font-size', labelSize)
            .attr('text-anchor', 'middle');

        return selection;
    }

}