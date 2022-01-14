export default class Edge {

    type = 'edge'
    
    // constructor({ id, source, target, label }) {
    //     this.id = id;
    //     this.source = source;
    //     this.target = target;
    //     this.label = label;
    // }

    constructor(data, view) {
        this.data = data;
        this.view = view;
    }

}