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

export interface AxisComponentRenderOptions {
    viewport: IViewport;
    settings: AxisDescriptor;
    series: DataRepresentationSeries;
    y: DataRepresentationAxis;
}

export class AxisComponent extends BaseComponent<VisualComponentConstructorOptions, AxisComponentRenderOptions> {
    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "axisComponent",
            "g",
        );
    }

    public render(options: AxisComponentRenderOptions): void {
        const { settings } = options;

        if (settings.shouldBeShown()) {
            this.show();
            this.renderComponent(options);
        } else {
            this.hide();
        }
    }

    private renderComponent(options: AxisComponentRenderOptions) {
        const {
            y,
            series,
            settings,
            viewport,
        } = options;

        const xScale: DataRepresentationScale = options.series.x.scale
            .copy()
            .range([0, viewport.width]);

        const yScale: DataRepresentationScale = y.scale
            .copy()
            .range([viewport.height, 0]);

        const domain: number[] = yScale.getDomain() as number[];

        const axisValueFormatter: IValueFormatter = valueFormatter.create({
            format: settings.getFormat(),
            value: settings.displayUnits || domain[1] || domain[0],
            precision: settings.precision,
            displayUnitSystemType: 2,
        });

        const yAxis = d3.svg.axis()
            .scale(yScale.getScale())
            .tickValues(domain)
            .tickFormat((value: number) => {
                return axisValueFormatter.format(value);
            })
            .orient("right");

        this.element.call(yAxis);

        this.element
            .selectAll(".tick text")
            .each(function (_, elementIndex: number) {
                d3.select(this)
                    .attr({
                        x: settings.axisLabelX,
                        y: elementIndex
                            ? settings.axisLabelY
                            : -settings.axisLabelY
                    })
                    .style({
                        fill: settings.color,
                    });
            });

        this.updateFormatting(this.element, settings);
    }
}
