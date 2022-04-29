import EventEmitter from 'eventemitter3';

export default class Edge extends EventEmitter {

    type = 'edge'
    
    // constructor({ id, source, target, label }) {
    //     this.id = id;
    //     this.source = source;
    //     this.target = target;
    //     this.label = label;
    // }

    constructor(data, view) {
        super();
        const self = this;
        this.data = new Proxy(data, {
            get: function (obj, key) {
                return obj[key];
            },
            set: function (obj, key, newValue) {
                obj[key] = newValue;
                self.dirty = true;
                self.emit('update', { type: 'update', edge: self });
                return true;
            }
        });
        this.view = view;
    }

}