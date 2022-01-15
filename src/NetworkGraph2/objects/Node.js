export default class Node {

    type = 'node'

    // constructor({
    //     id,
    //     x = 0,
    //     y = 0,
    //     label = ''
    // } = {}) {
    //     this.id = id;
    //     this.x = x;
    //     this.y = y;
    //     this.label = label;
    //     this.size = 15;
    // }

    constructor(data, view) {
        this.data = { size: 15, ...data };
        this.view = view;
    }

}