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

export class MainChartComponent extends BaseContainerComponent<VisualComponentConstructorOptions, VisualComponentRenderOptions, any> {
    private chart: VisualComponent<ChartComponentRenderOptions>;
    private chartLabel: VisualComponent<ChartLabelComponentRenderOptions>;

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "mainChartComponent"
        );

        this.constructorOptions = {
            ...options,
            element: this.element
        };

        this.chart = new ChartComponent(this.constructorOptions);
        this.chartLabel = new ChartLabelComponent(this.constructorOptions);

        this.components = [
            this.chart,
            this.chartLabel,
        ];

        this.initMouseEvents();
    }

    private initMouseEvents(): void {
        const eventDispatcher: D3.Dispatch = this.constructorOptions.eventDispatcher;

        const onMouseMove = function (e: any) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            d3.event.stopImmediatePropagation();

            eventDispatcher[EventName.onMouseMove](d3.mouse(this));
        };

        this.element.on("mousemove", onMouseMove);
        this.element.on("touchmove", onMouseMove);
        this.element.on("touchstart", onMouseMove);

        const onMouseOut = function (e: any) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            d3.event.stopImmediatePropagation();

            eventDispatcher[EventName.onMouseOut]();
            eventDispatcher[EventName.onChartChangeStop]();
            eventDispatcher[EventName.onChartViewReset]();
        };

        this.element.on("mouseout", onMouseOut);
        this.element.on("mouseleave", onMouseOut);
        this.element.on("touchleave", onMouseOut);

        this.element.on("mouseenter", () => {
            this.constructorOptions.eventDispatcher[EventName.onChartChangeStop]();
        });
    }

    public render(options: VisualComponentRenderOptions): void {
        const { viewport } = options;

        this.updateSize(viewport.width, viewport.height);

        const data: ChartComponentRenderOptions = {
            viewport,
            series: options.data.series[0],
            settings: options.settings,
            viewportSize: options.data.viewportSize,
        };

        this.chart.render(data);

        this.element.attr(
            "title",
            data.series && data.series.formattedTooltip || null
        );

        this.chartLabel.render({
            viewport,
            series: data.series,
            kpiSettings: options.settings.kpi,
            dateSettings: options.settings.date,
        });
    }
}
