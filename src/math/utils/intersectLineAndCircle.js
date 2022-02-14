import Vector2 from "../Vector2";

function sgn(x) {
    if (x < 0) return -1;
    return 1;
}

// https://mathworld.wolfram.com/Circle-LineIntersection.html
export default function (line, circle) {
    const x1 = line.p1.x - circle.center.x;
    const y1 = line.p1.y - circle.center.y;
    const x2 = line.p2.x - circle.center.x;
    const y2 = line.p2.y - circle.center.y;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const d = x1 * y2 - x2 * y1;
    const delta =  circle.r * circle.r * dr * dr - d * d;

    if (delta < 0) {
        return null;
    } else if (delta === 0) {
        return new Vector2(
            d * dy / (dr * dr) + circle.center.x,
            -d * dx / (dr * dr) + circle.center.y
        );
    } else {
        const drdr = dr * dr;
        const sqrtDelta = Math.sqrt(delta);
        const absDy = Math.abs(dy);
        return [
            new Vector2(
                (d * dy + sgn(dy) * dx * sqrtDelta) / drdr + circle.center.x,
                (-d * dx + absDy * sqrtDelta) / drdr + circle.center.y
            ),
            new Vector2(
                (d * dy - sgn(dy) * dx * sqrtDelta) / drdr + circle.center.x,
                (-d * dx - absDy * sqrtDelta) / drdr + circle.center.y
            ),
        ];
    }
}