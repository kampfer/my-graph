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

    filterChild(callback) {
        const children = [];
        this.traverse(child => {
            if (callback(child) === true) children.push(child);
        });
        return children;
    }

    traverse(callback) {
        this._children.forEach(child => {
            callback(child);
            if (child.traverse) child.traverse(callback);
        });
    }

    children() {
        return this._children;
    }

}