import Layout from './Layout';
import * as d3 from 'd3-force';

export default class ForceLayout extends Layout {

    constructor({
        linkDistance = 200,
        manyBodyStrength = -500,
        manyBodyTheta = 0.9,
        xStrength = 0.05,
        yStrength = 0.05,
    } = {}) {
        super();
        
        this.linkForce = d3.forceLink().id(d => d.id).distance(linkDistance);
        this.manyBodyForce = d3.forceManyBody().strength(manyBodyStrength).theta(manyBodyTheta);
        this.xForce = d3.forceX(0).strength(xStrength);
        this.yForce = d3.forceY(0).strength(yStrength);

        this.forceSimulation = d3.forceSimulation();

        // 不要自动启动布局
        this.forceSimulation.stop()
            // 配置排斥力，引力，连接力
            .force('edge', this.linkForce)
            .force('change', this.manyBodyForce)
            .force('x', this.xForce)
            .force('y', this.yForce);

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
        this.forceSimulation.stop();
    }

} 