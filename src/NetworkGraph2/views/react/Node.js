import React from 'react';

export default class Node extends React.Component {

    constructor(props) {
        super(props);

        this.domRef = React.createRef();
    }

    render() {
        const {
            x = 0, 
            y = 0, 
            size = 15, 
            labelSize= 14, 
            label,
            id,
            hideLabel,
            hidden
        } = this.props.data;
        return React.createElement(
            'g', 
            {
                ref: this.domRef,
                id,
                className: 'node',
                transform: `translate(${x}, ${y})`,
                style: {
                    display: hidden ? 'none' : 'unset'
                }
            }, 
            React.createElement(
                'circle', 
                { 
                    r: size 
                }
            ), 
            React.createElement(
                'text', 
                { 
                    x: 0, 
                    y: size + labelSize, 
                    fontSize: labelSize, 
                    textAnchor: 'middle',
                    style: {
                        display: hideLabel ? 'none' : 'unset'
                    }
                },
                label
            )
        );
    }

}
