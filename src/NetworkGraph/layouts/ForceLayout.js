import Layout from './Layout';
import * as d3 from 'd3';

export default class ForceLayout extends Layout {

    constructor(...args) {
        super(...args);
        
        this.linkForce = d3.forceLink().id(d => d.id).distance(200);

        this.forceSimulation = d3.forceSimulation();

        // 不要自动启动布局
        this.forceSimulation.stop()
            // 配置排斥力，引力，连接力
            .force('edge', this.linkForce)
            .force('change', d3.forceManyBody().strength(-500))
            .force('x', d3.forceX().strength(0.05))
            .force('y', d3.forceY().strength(0.05));

        this.forceSimulation.on('tick', (...args) => this.emit('tick', ...args));
        this.forceSimulation.on('end', (...args) => this.emit('end', ...args));

    }

    data({ nodes, edges }) {
        this.reset();
        this.forceSimulation.nodes(nodes);
        this.linkForce.links(edges);
    }

    // 重置状态
    reset() {
        this.forceSimulation.alpha(1);
    }

    start() {
        this.forceSimulation.stop();
        this.forceSimulation.alpha(1);
        // d3-force没有start方法，需要自己模拟
        this.forceSimulation.restart();
    }

    resume() {
        this.forceSimulation.restart();
    }

    stop() {
        this.this.forceSimulation.stop();
    }

} 