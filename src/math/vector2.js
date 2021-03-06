// https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js

export default class Vector2 {

    static fromAddVectors(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static fromSubVectors(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y); 
    }

    static fromArray(arr) {
        return new Vector2(arr[0], arr[1]);
    }

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply() {}

    divide() {}

    addScalar(v) {
        this.x += v;
        this.y += v;
        return this;
    }

    subScalar(v) {
        this.x -= v;
        this.y -= v;
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    clone() {
        return new this.constructor(this.x, this.y);
    }

    // angle > 0 顺时针
    // angle < 0 逆时针
    rotateAround(center, angle) {
        const s = Math.sin(angle),
              c = Math.cos(angle),
              x = this.x - center.x,
              y = this.y - center.y;
        this.x = c * x - s * y + center.x;
        this.y = s * x + c * y + center.y;
        return this;
    }

}