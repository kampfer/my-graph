import React from 'react';

export default class Node extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {
            x = 0, 
            y = 0, 
            size = 15, 
            labelSize= 14, 
            label,
            id
        } = this.props.data;
        return React.createElement(
            'g', 
            {
                id,
                className: 'node',
                transform: `translate(${x}, ${y})`
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
                    textAnchor: 'middle' 
                },
                label
            )
        );
    }

}