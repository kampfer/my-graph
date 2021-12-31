export default {

    type: 'node',

    enter(d) {
        const selection = d3.create('svg:g');
        selection
            .datum(d)
            .classed('node.node-group', true);

        const circleSelection = selection.append('circle');
        circleSelection
            .classed('node', true);

        const textSelection = selection.append('text');
        textSelection
            .classed('node-label', true);

        return selection;
    },
    
    update(d) {
        let circleSelection, textSelection;
    }

}