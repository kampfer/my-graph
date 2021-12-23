export default class Behavior {

    constructor(graph) {
        this.graph = graph;
    }

    // 遍历events属性绑定事件：使用key作为事件名，value作为事件处理函数
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