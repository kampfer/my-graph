import EventEmitter from 'eventemitter3';

export default class Object extends EventEmitter {

    constructor() {
        super();
        this._children = [];
        this._parent = null;
    }

    addChild(child) {
        if (child) {
            this._children.push(child);
            child._parent = this;
        }
    }

    prependChild(child) {
        if (child) {
            this._children.unshift(child);
            child._parent = this;
        }
    }

    removeChild(child) {
        const index = this._children.findIndex(child);
        if (index > -1) {
            const child = this._children[index];
            child._parent = null;
            this._children.splice(index, 1);
        }
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