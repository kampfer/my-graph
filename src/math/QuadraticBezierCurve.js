// https://github.com/mrdoob/three.js/blob/master/src/extras/curves/QuadraticBezierCurve.js

import Vector2 from "./Vector2.js";

export default class QuadraticBezierCurve {

    constructor(v0, v1, v2) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
    }

    getPoint(t, target = new Vector2()) {
        target.set(
            QuadraticBezierCurve.interpolate(t, this.v0.x, this.v1.x, this.v2.x),
            QuadraticBezierCurve.interpolate(t, this.v0.y, this.v1.y, this.v2.y),
        )
        return target;
    }

    getDerivative(t) {
        const v0 = this.v0;
        const v1 = this.v1;
        const v2 = this.v2;
        const t1 = 1 - t;
        return ( t1 * (v1.y - v0.y) + t * (v2.y - v1.y)) / ( t1 * (v1.x - v0.x) + t * (v2.x - v1.x));
    }

    static interpolate(t, p0, p1, p2) {
        const t1 = 1 - t;
        return t1 * t1 * p0 + 2 * t1 * t * p1 + t * t * p2;
    }

}