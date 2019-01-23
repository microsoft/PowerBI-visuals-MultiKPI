/**
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

export interface DotsComponentRenderOptions {
    viewport: IViewport;
    x: DataRepresentationAxis;
    y: DataRepresentationAxis;
    points: DataRepresentationPoint[];
    settings: SparklineChartDescriptor;
}

export class DotsComponent extends BaseComponent<VisualComponentConstructorOptions, DotsComponentRenderOptions> {
    private dotSelector: ClassAndSelector = this.getSelectorWithPrefix("dot");

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "dotsComponent",
            "g"
        );
    }

    public render(options: DotsComponentRenderOptions): void {
        const {
            x,
            y,
            points,
            viewport,
            settings,
        } = options;

        const xScale: DataRepresentationScale = x.scale
            .copy()
            .range([0, viewport.width]);

        const yScale: DataRepresentationScale = y.scale
            .copy()
            .range([viewport.height, 0]);

        const dotSelection: D3.UpdateSelection = this.element
            .selectAll(this.dotSelector.selector)
            .data(points);

        dotSelection
            .enter()
            .append("circle")
            .classed(this.dotSelector.class, true);

        dotSelection
            .attr({
                cx: (point: DataRepresentationPoint) => xScale.scale(point.x),
                cy: (point: DataRepresentationPoint) => yScale.scale(point.y),
                r: settings.getRadius(),
            })
            .style("fill", settings.color);

        dotSelection
            .exit()
            .remove();
    }

    public clear(): void {
        this.element
            .selectAll("*")
            .remove();
    }

    public destroy(): void {
        this.element = null;
    }
}
