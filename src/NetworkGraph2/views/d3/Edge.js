import Vector2 from '../../../math/Vector2';
import QuadraticBezierCurve from '../../../math/QuadraticBezierCurve';
import Line from '../../../math/Line';
import Circle from '../../../math/Circle';
import intersectSegmentAndCircle from '../../../math/utils/intersectSegmentAndCircle';

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

function getNewBezierPoint(start, c1, end, r, target) {

    const curve = new QuadraticBezierCurve(start, c1, end);

    function iter(p) {
        const line = new Line(c1, p);
        const circle = new Circle(target, r);
        const j1 = intersectSegmentAndCircle(line, circle);
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
    let source = new Vector2(d.source.x, d.source.y);
    let target = new Vector2(d.target.x, d.target.y);
    let sourceSize = getNodeSize(d.source);
    let targetSize = getNodeSize(d.target);

    // 保证x坐标更小的节点是source节点
    // 这样才能保证文字是从左往右的
    if (target.x < source.x) {
        [source, target] = [target, source];
        [sourceSize, targetSize] = [targetSize, sourceSize];
    }

    if (d.source === d.target) {  // 环形

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

        if (d.sameTotal === 1 || d.sameMiddleLink) {  // 直线
            const line = new Line(source, target);
            const sourceCircle = new Circle(source, sourceSize);
            const targetCircle = new Circle(target, targetSize);
            const p1 = intersectSegmentAndCircle(line, sourceCircle);
            const p2 = intersectSegmentAndCircle(line, targetCircle);
            if (p1 && p2) {
                return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            } else {
                return '';
            }
        } else {    // 曲线
            const delta = 20;
            const p1 = getMiddlePointOfBezierCurve(source, target, delta * d.sameIndexCorrected);
            const c1 = getControlPointOfBezierCurve(source, p1, target);
            const p2 = getNewBezierPoint(source, c1, target, sourceSize, source);
            const p3 = getNewBezierPoint(source, c1, target, targetSize, target);
            const c2 = getControlPointOfBezierCurve(p2, p1, p3);
            return `M ${p2.x} ${p2.y} Q ${c2.x} ${c2.y} ${p3.x} ${p3.y}`;
        }

    }
    
};

export default {

    type: 'edge',

    create(datum, parentSelection) {
        parentSelection
            .classed('edge', true)
            .attr('id', datum.id);

        parentSelection.append('marker')
            .attr('id', `arrow-${datum.id}`)
            .attr('class', `arrow ${datum.id}`)
            .attr('viewbox', '-10 -5 10 10')
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('overflow', 'visible')
            .attr('orient', 'auto-start-reverse')
            .append('svg:path')
            .attr('d', 'M -10,-5 L 0 ,0 L -10,5');

        parentSelection.append('path')
            // .attr('stroke', '#000')
            .classed('edge', true)
            .attr('id', `edge-${datum.id}`)
            .attr('fill', 'none');

        parentSelection.append('text')
            .classed('edge-label', true)
            // .classed('hidden', datum.visible === false)
            .append('textPath')
                .attr('xlink:href', `#edge-${datum.id}`)
                .attr('text-anchor', 'middle')
                .attr('startOffset', '50%');

        this.update(datum, parentSelection);
    },

    update(datum, selection) {
        selection.attr('display', datum.hidden === true ? 'none' : 'unset');

        selection.select('text')
            .attr('font-size', datum.labelSize)
            .attr('stroke', 'none')
            .attr('fill', datum.labelColor)
            .attr('display', datum.hideLabel === true ? 'none' : 'unset');

        selection.select('marker')
            .attr('fill', datum.selected ? datum.activeColor : datum.color);

        const textPathSelection = selection.select('textPath');
        textPathSelection.text(datum.label ? datum.label : '')

        const pathSelection = selection.select('path.edge');
        pathSelection.attr('stroke', datum.selected ? datum.activeColor : datum.color);
        if (datum.target.x < datum.source.x) {  // 反
            pathSelection.attr('marker-start', `url(#arrow-${datum.id})`);
            pathSelection.attr('marker-end', 'none');
        } else {    // 正
            pathSelection.attr('marker-start', 'none');
            pathSelection.attr('marker-end', `url(#arrow-${datum.id})`);
        }

        pathSelection.attr('d', linkArc(datum));
    }

}