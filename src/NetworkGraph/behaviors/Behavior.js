export default class Behavior {

    constructor(graph) {
        this.graph = graph;
    }

    use() {
        if (this.events) {
            Object.entries(this.events).forEach(([eventName, callback]) => {
                this.graph.on(eventName, callback);
            });
        }
    }

    unuse() {
        if (this.events) {
            Object.entries(this.events).forEach(([eventName, callback]) => {
                this.graph.off(eventName, callback);
            });
        }
    }

    destroy() {
        this.unuse();
        this.events = null;
    }

    // _fixEventHandles(events = this.events) {
    //     Object.entries(events).forEach(([eventName, callback]) => {
    //         events[eventName] = callback.bind(this);
    //     });
    // }

}