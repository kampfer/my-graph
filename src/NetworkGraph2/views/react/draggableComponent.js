import React from "react";
import * as d3 from 'd3';

export default function draggableComponent(Component, {
    onDragstart,
    onDrag,
    onDragend,
}) {

    const d3Drag = d3.drag()
        .on('start', function(e) { onDragstart(e, this) })
        .on('drag', function(e) { onDrag(e, this) })
        .on('end', function(e) { onDragend(e, this) });

    return class extends React.Component {

        constructor(props) {
            super(props);
            this.ref = React.createRef();

            // this.d3Drag = d3.drag()
            //     // .on('start', e => onDragstart(e, this))
            //     .on('start', function(e) { onDragstart(e, this) })
            //     .on('drag', e => onDrag(e, this))
            //     .on('end', e => onDragend(e, this))
        }

        componentDidMount() {
            const nodeComponet = this.ref.current;
            d3.select(nodeComponet.domRef.current).call(d3Drag);
        }

        // componentWillUnmount() {
        //     this.d3Drag
        //         .on('start', null)
        //         .on('drag', null)
        //         .on('end', null);
        // }

        render() {
            const props = this.props;
            // return React.createElement(Component, { ref: this.ref, ...props });
            return React.createElement(
                Component,
                {
                    ref: this.ref,
                    ...props
                }
            );
        }

    }
    
}