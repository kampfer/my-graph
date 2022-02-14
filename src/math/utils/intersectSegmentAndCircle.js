import intersectLineAndCircle from "./intersectLineAndCircle";

export default function(line, circle) {
    let points = intersectLineAndCircle(line, circle);
    if (points) {
        const maxX = line.maxX();
        const minX = line.minX();
        if (Array.isArray(points)) {
            return points.find(point => point.x >= minX && point.x <= maxX);
        } else {
            return points.x >= minX && points.x <= maxX ? points : null;
        }
    }
    return points;
}