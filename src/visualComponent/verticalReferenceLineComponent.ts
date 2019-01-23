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

export interface VerticalReferenceLineComponentRenderOptions extends VisualComponentRenderOptionsBase {
    offset: number;
    viewport: IViewport;
    series: DataRepresentationSeries;
    dataPoint: DataRepresentationPoint;
    kpiSettings: KpiDescriptor;
    dateSettings: FormatDescriptor;
}

export class VerticalReferenceLineComponent extends BaseComponent<VisualComponentConstructorOptions, VerticalReferenceLineComponentRenderOptions> {
    private lineSelector: ClassAndSelector = this.getSelectorWithPrefix("verticalLine");

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "verticalLineComponent",
            "g"
        );
    }

    public render(options: VerticalReferenceLineComponentRenderOptions): void {
        const {
            offset,
            viewport,
            series: { x },
            dataPoint,
        } = options;

        const xScale: DataRepresentationScale = x.scale
            .copy()
            .range([offset, viewport.width]);

        const xPosition: number = xScale.scale(dataPoint && dataPoint.x);

        const lineSelection: D3.UpdateSelection = this.element
            .selectAll(this.lineSelector.selector)
            .data(dataPoint ? [dataPoint] : []);

        lineSelection
            .enter()
            .append("line")
            .classed(this.lineSelector.class, true);

        lineSelection
            .attr({
                x1: xPosition,
                x2: xPosition,
                y1: 0,
                y2: viewport.height,
            });

        lineSelection
            .exit()
            .remove();
    }
}
