import EventEmitter from 'eventemitter3';

export default class Layout extends EventEmitter {

    constructor(graph) {
        super();
        this.graph = graph;
    }

    data() {}

    start() {}
    
    resume() {}

    stop() {}

}