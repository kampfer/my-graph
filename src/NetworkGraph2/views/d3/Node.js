export default {
    type: 'node',
    create(datum, selection) {
        selection.append('circle');
        selection.append('text');
    },
    update(datum, selection) {
        const x = datum.x;
        const y = datum.y;
        const size = 15;
        const labelSize = 14;
        const label = datum.label;

        selection
            .attr('display', datum.hidden === true ? 'none' : 'unset')
            .attr('transform', `translate(${x}, ${y})`);

        selection.select('circle')
            .attr('r', size);

        selection.select('text')
            .text(label)
            .style('display', datum.hideLabel === true ? 'none' : 'unset')
            .attr('x', 0)
            .attr('y', size + labelSize)
            .style('font-size', labelSize)
            .attr('text-anchor', 'middle');
    }
}
