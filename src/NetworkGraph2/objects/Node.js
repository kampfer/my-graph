export default class Node {

    type = 'node'

    constructor({
        id,
        x = 0,
        y = 0,
        label = ''
    } = {}) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.label = label;
    }

    render(selection) {
        const size = 15;
        const labelSize = 14;
        const label = this.label;
        const x = this.x;
        const y = this.y;

        selection
            .attr('transform', `translate(${x}, ${y})`);

        selection.selectAll('circle')
            .data([size])
            .join('circle')
            .attr('r', d => d);

        selection.selectAll('text')
            .data([label])
            .join('text')
                .text(d => d)
                .attr('x', 0)
                .attr('y', size + labelSize)
                .style('font-size', labelSize)
                .attr('text-anchor', 'middle');
    }

}