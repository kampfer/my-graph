export default {
    type: 'node',
    create(datum, selection) {
        selection.append('circle');
        selection.append('text');
    },
    update(datum, selection) {
        const x = datum.x;
        const y = datum.y;
        const size = datum.size === undefined ? 15 : datum.size;
        const labelSize = datum.labelSize === undefined ? 14 : datum.labelSize;
        const label = datum.label;

        // TODO 所有类型的节点有需要以下操作，需要提取到公用位置
        selection
            .classed('selected', datum.selected)
            .classed('hidden', datum.hidden)
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
