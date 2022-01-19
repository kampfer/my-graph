import React from 'react';

import Vector2 from '../../../math/Vector2';
import QuadraticBezierCurve from '../../../math/QuadraticBezierCurve';

function getNodeSize(d) {
    if (d.size) return d.size;
}

function project(p, p1, p2) {
    const v1 = Vector2.fromSubVectors(p, p1);
    const v2 = Vector2.fromSubVectors(p2, p1);
    const k = v1.dot(v2) / v2.lengthSq();
    return new Vector2().add(p1).add(v2.multiplyScalar(k));
}

function getMiddlePointOfBezierCurve(start, end, d) {
    if (start.x === end.x) {
        return new Vector2(start.x + d, (start.y + end.y) / 2);
    }

    if (start.y === end.y) {
        return new Vector2((start.x + end.x) / 2, start.y + d);
    }

    const a = end.x - start.x;
    const b = end.y - start.y;
    const xc = (start.x + end.x) / 2;
    const yc = (start.y + end.y) / 2;
    const r = b / a;
    const sqrtPart = d / Math.sqrt(Math.pow(r, 2) + 1);
    const y = yc - sqrtPart;
    return new Vector2(xc + r * yc - r * y, y);
}

function getControlPointOfBezierCurve(p0, p1, p2) {
    const t = 0.5;
    const mt = (1 - t);
    const tt = Math.pow(t, 2);
    const mtt = Math.pow(mt, 2);
    const d = 2 * t * mt;
    return new Vector2(
        (p1.x - tt * p2.x - mtt * p0.x) / d,
        (p1.y - tt * p2.y - mtt * p0.y) / d,
    );
}

function getIntersectPointBetweenCircleAndLine(p0, p1, c, r) {
    const alpha = (p1.y - p0.y) / (p1.x - p0.x);
    const beta = (p1.x * p0.y - p0.x * p1.y) / (p1.x - p0.x);
    const a = 1 + alpha * alpha;
    const b = -2 * (c.x - alpha * beta + alpha * c.y);
    const _c = c.x * c.x + beta * beta - 2 * beta * c.y + c.y * c.y - r * r;
    const s = b * b - 4 * a * _c;
    if (s < 0) {
        return null;
    } else if (s === 0) {
        const u = -b / (2 * a);
        return new Vector2(u, alpha * u + beta);
    } else {
        const u1 = (-b + Math.sqrt(s)) / (2 * a);
        const u2 = (-b - Math.sqrt(s)) / (2 * a);
        return [
            new Vector2(u1, alpha * u1 + beta),
            new Vector2(u2, alpha * u2 + beta),
        ];
    }
}

function getIntersectPointBetweenCircleAndSegment(p0, p1, c, r) {
    let points = getIntersectPointBetweenCircleAndLine(p0, p1, c, r);
    if (points) {
        const max = Math.max(p0.x, p1.x);
        const min = Math.min(p0.x, p1.x);
        if (Array.isArray(points)) {
            return points.find(point => point.x >= min && point.x <= max);
        } else {
            return points.x >= min && points.x <= max ? points : null;
        }
    }
    return points;
}

function getNewBezierPoint(start, c1, end, r, target) {

    const curve = new QuadraticBezierCurve(start, c1, end);

    function iter(p) {
        const j1 = getIntersectPointBetweenCircleAndSegment(c1, p, target, r);
        const pj1 = project(j1, start, end);
        const k = pj1.clone().sub(start).length() / start.clone().sub(end).length();
        const p2 = curve.getPoint(k);
        const delta = p2.clone().sub(j1).length();

        if (delta <= 5) {
            return p2;
        } else {
            return iter(p2);
        }
    }

    return iter(target);

}

function linkArc(d) {
    // debugger;
    // if (typeof d.source === 'string' || typeof d.target === 'string') return '';

    let source = new Vector2(d.source.x, d.source.y);
    let target = new Vector2(d.target.x, d.target.y);
    if (target.x < source.x) [source, target] = [target, source];

    if (d.source === d.target) {

        const theta = -Math.PI / 3;
        const r = getNodeSize(d.source);
        const j = new Vector2(Math.cos(theta) * r, Math.sin(theta) * r).add(source);

        const angle = Math.PI / 12 * d.sameIndexCorrected;
        const start = j.clone().rotateAround(source, -angle);
        const end = j.clone().rotateAround(target, angle);

        const l = 4 * r;
        const ratio = Math.cos(angle) * r / (Math.cos(angle) * r + l + d.sameIndexCorrected * 2 * r);
        const c1 = new Vector2(
            (start.x - source.x) / ratio + source.x,
            (start.y - source.y) / ratio + source.y,
        );
        const c2 = new Vector2(
            (end.x - target.x) / ratio + target.x,
            (end.y - target.y) / ratio + target.y,
        );

        return `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;

    } else {

        if (d.sameTotal === 1 || d.sameMiddleLink) {
            const p1 = getIntersectPointBetweenCircleAndSegment(source, target, source, getNodeSize(d.source));
            const p2 = getIntersectPointBetweenCircleAndSegment(source, target, target, getNodeSize(d.target));
            if (p1 && p2) {
                return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            } else {
                return '';
            }
        } else {
            const delta = 20;
            const p1 = getMiddlePointOfBezierCurve(source, target, delta * d.sameIndexCorrected);
            const c1 = getControlPointOfBezierCurve(source, p1, target);
            const p2 = getNewBezierPoint(source, c1, target, getNodeSize(d.source), source);
            const p3 = getNewBezierPoint(source, c1, target, getNodeSize(d.target), target);
            const c2 = getControlPointOfBezierCurve(p2, p1, p3);
            return `M ${p2.x} ${p2.y} Q ${c2.x} ${c2.y} ${p3.x} ${p3.y}`;
        }

    }

};

export default class Edge extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {
            id,
            label,
            source,
            target,
            hideLabel,
            hidden,
        } = this.props.data;
        const arrowId = `arrow-${id}`;
        const pathId = `edge-path-${id}`;
        return React.createElement(
            'g',
            {
                id,
                className: 'edge',
                style: {
                    display: hidden ? 'none' : 'unset'
                }
            },
            React.createElement(
                'defs',
                null,
                React.createElement(
                    'marker',
                    {
                        id: arrowId,
                        className: 'arrow',
                        viewBox: '-10 -5 10 10',
                        refX: 0,
                        refY: 0,
                        markerWidth: 6,
                        markerHeight: 6,
                        overflow: 'visible',
                        orient: 'auto-start-reverse'
                    },
                    React.createElement(
                        'path',
                        {
                            d: 'M -10,-5 L 0 ,0 L -10,5'
                        }
                    )
                )
            ),
            React.createElement(
                'path',
                {
                    stroke: '#000',
                    className: 'edge-path',
                    fill: 'none',
                    id: pathId,
                    markerStart: target.x < source.x ? `url(#${arrowId})` : 'none',
                    markerEnd: target.x < source.x ? 'none' : `url(#${arrowId})`,
                    d: linkArc(this.props.data)
                }
            ),
            React.createElement(
                'text',
                {
                    className: 'edge-label',
                    style: {
                        display: hideLabel ? 'none' : 'unset'
                    }
                },
                React.createElement(
                    'textPath',
                    {
                        xlinkHref: `#${pathId}`,
                        textAnchor: 'middle',
                        startOffset: '50%',
                    },
                    label
                )
            )

        );
    }

}