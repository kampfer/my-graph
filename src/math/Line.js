export default class Line {
    
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    maxX() {
        return Math.max(this.p1.x, this.p2.x);
    }

    minX() {
        return Math.min(this.p1.x, this.p2.x);
    }

    maxY() {
        return Math.max(this.p1.y, this.p2.y);
    }

    minY() {
        return Math.min(this.p1.y, this.p2.y);
    }

}