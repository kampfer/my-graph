const style = `
.node-group.hidden,
.edge-group.hidden,
.no-edge-label .edge-label,
.no-node-label .node-label,
.no-edge .edge-group {
    display: none;
}

.no-edge-direction .edge {
    marker-start: unset;
    marker-end: unset;
}
`;

export default style;