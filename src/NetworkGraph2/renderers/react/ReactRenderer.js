import React from 'react';
import ReactDOM from 'react-dom';

class ReactGraph extends React.Component {

    constructor(...args) {
        super(...args);

        this.svgRef = React.createRef();

        // this.state = {
        //     width: 300,
        //     height: 150,
        //     viewBox: [0, 0, 300, 150],
        //     elements: []
        // };
    }

    domElement() {
        return this.svgRef.current;
    }

    render() {
        const { graph, width, height, viewBox } = this.props;
        return React.createElement(
            'svg',
            {
                width,
                height,
                viewBox,
                ref: this.svgRef,
                xmlns: 'http://www.w3.org/2000/svg',
                xmlnsXlink: 'http://www.w3.org/1999/xlink'
            },
            React.createElement('defs', null),
            React.createElement(
                'g', 
                null,
                graph.children().map(
                    item => React.createElement(
                        item.view, 
                        { key: item.data.id, data: item.data }
                    )
                ),
            ),
        );
    }

}

export default class ReactRenderer {

    constructor({
        container,
        width,
        height,
        viewBox,
    }) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.viewBox = viewBox;
        this.graphRef = React.createRef();
    }

    setViewBox(x, y, width, height) {
        // this.graphRef.current.setState({ viewBox: [x, y, width, height] });
        this.viewBox = [x, y, width, height];
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        // this.graphRef.current.setState({ width, height });
    }

    domElement() {
        return this.graphRef.current;
    }

    render(graph) {
        const container = this.container;
        const width = this.width;
        const height = this.height;
        const viewBox = this.viewBox;
        ReactDOM.render(
            React.createElement(
                ReactGraph, 
                { 
                    ref: this.graphRef, 
                    graph, 
                    width, 
                    height, 
                    viewBox 
                }
            ),
            container
        );
    }

}