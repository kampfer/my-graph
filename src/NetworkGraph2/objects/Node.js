import EventEmitter from 'eventemitter3';

export default class Node extends EventEmitter {

    type = 'node'

    constructor(data, view) {
        super();
        const self = this;
        this.data = new Proxy({ 
            size: 15,
            ...data
        }, {
            get: function (obj, key) {
                return obj[key];
            },
            set: function (obj, key, newValue) {
                obj[key] = newValue;
                self.emit('update', { type: 'update', node: self });
                return true;
            }
        });
        this.view = view;
    }

}