export default class Object {

    constructor() {
        this._children = [];
    }

    addChild(child) {
        if (child) this._children.push(child);
    }

    removeChild(child) {
        const index = this._children.findIndex(child);
        if (index > -1) this._children.splice(index, 1);
    }

    eachChild(callback) {
        this._children.forEach((...args) => callback(...args));
    }

    filterChild(callback) {
        return this._children.filter(callback);
    }

}