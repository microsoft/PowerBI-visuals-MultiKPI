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

export interface ZeroLineRenderOptions {
    series: DataRepresentationSeries;
    chart: ChartDescriptor;
    viewport: IViewport;
}

export interface ChartComponentRenderOptions extends VisualComponentRenderOptionsBase {
    series: DataRepresentationSeries;
    viewport: IViewport;
    settings: Settings;
    viewportSize: ViewportSize;
}

export interface ChartComponentInnerRenderOptions extends LineComponentRenderOptions {
    settings: ChartDescriptor;
}

export class ChartComponent extends BaseContainerComponent<VisualComponentConstructorOptions, ChartComponentRenderOptions, VisualComponentRenderOptionsBase> {
    private dataBisector: Function = d3.bisector((d: DataRepresentationPoint) => { return d.x; }).left;

    private className: string = "chartComponent";

    private zeroLineSelection: D3.Selection;

    private axisComponent: VisualComponent<AxisComponentRenderOptions>;
    private lineComponent: VisualComponent<LineComponentRenderOptions>;

    private dynamicComponents: VisualComponent<HoverLabelComponentRenderOptions>[] = [];

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className,
            "svg"
        );

        this.constructorOptions = {
            ...options,
            element: this.element,
            id: this.className,
        };

        this.lineComponent = new LineComponent(this.constructorOptions);
        this.axisComponent = new AxisComponent(this.constructorOptions);

        this.components = [
            this.lineComponent,
            this.axisComponent,
        ];

        this.zeroLineSelection = this.element
            .append("path")
            .attr("class", "zero-axis");

        this.dynamicComponents = [
            new VerticalReferenceLineComponent(this.constructorOptions),
            new HoverLabelComponent(options),
        ];

        this.hideComponents();

        this.constructorOptions.eventDispatcher
            .on(`${EventName.onMouseMove}.${this.className}`, ([leftPosition]) => {
                const index: number = this.getDataPointIndexByPosition(leftPosition);

                this.constructorOptions.eventDispatcher[EventName.onCurrentDataPointIndexChange](index);
            });

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onMouseOut}.${this.className}`,
            () => {
                const latestDataPoint: DataRepresentationPoint = this.renderOptions
                    && this.renderOptions.series
                    && this.renderOptions.series.points
                    && this.renderOptions.series.points[this.renderOptions.series.points.length - 1];

                this.constructorOptions.eventDispatcher[EventName.onCurrentDataPointIndexReset](latestDataPoint
                    ? latestDataPoint.index
                    : NaN
                );
            }
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexChange}.${this.className}`,
            this.renderDynamicComponentByDataPointIndex.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexReset}.${this.className}`,
            this.hideComponents.bind(this),
        );
    }

    private hideComponents(): void {
        this.forEach(
            this.dynamicComponents,
            (component: VisualComponent<any>) => {
                component.hide();
            });
    }

    private getDataPointIndexByPosition(position: number): number {
        if (!this.renderOptions || !this.renderOptions.series) {
            return NaN;
        }

        let areaScale: IViewport = this.constructorOptions.scaleService.getScale();

        const width: number = this.width;

        const scale: DataRepresentationScale = this.renderOptions.series.x.scale
            .copy()
            .range([0, width]);

        const thickness: number = this.renderOptions.settings.chart.thickness;

        const leftPosition: number = (position - thickness) / areaScale.width;

        const x: Date = scale.invert(leftPosition) as Date;

        return this.dataBisector(this.renderOptions.series.points, x, 1);
    }

    private renderDynamicComponentByDataPointIndex(index: number): void {
        if (!this.renderOptions
            || !this.renderOptions.series
            || !this.renderOptions.series.points
            || isNaN(index)
        ) {
            return;
        }

        const dataPoint: DataRepresentationPoint = this.renderOptions.series.points[index];

        const data: HoverLabelComponentRenderOptions = {
            dataPoint,
            viewport: {
                width: this.width,
                height: this.height,
            },
            series: this.renderOptions.series,
            offset: 0,
            kpiSettings: this.renderOptions.settings.kpi,
            dateSettings: this.renderOptions.settings.date,
            kpiOnHoverSettings: this.renderOptions.settings.kpiOnHover,
        };

        this.forEach(
            this.dynamicComponents,
            (component: VisualComponent<VerticalReferenceLineComponentRenderOptions>) => {
                component.show();

                component.render(data);
            }
        );
    }

    public render(options: ChartComponentRenderOptions): void {
        this.renderOptions = options;

        const {
            series,
            settings,
            viewport,
        } = options;

        this.hideComponents();
        this.updateSize(viewport.width, viewport.height);

        if (!series) {
            this.hide();
        } else {
            this.show();
        }

        this.renderZeroLine({
            series,
            viewport,
            chart: settings.chart,
        });

        this.lineComponent.render({
            viewport,
            x: series.x,
            y: series.y,
            points: series.points,
            color: settings.chart.color,
            type: settings.chart.chartType,
            thickness: settings.chart.thickness,
            alternativeColor: settings.chart.alternativeColor,
        });

        const margin: IMargin = this.getMarginByThickness(settings.chart.thickness);

        this.updateMargin(this.element, margin);

        this.axisComponent.render({
            series,
            viewport,
            y: series.y,
            settings: series.settings.yAxis,
        });
    }

    private renderZeroLine(options: ZeroLineRenderOptions) {
        const {
            series,
            chart,
            viewport,
        } = options;

        const xScale: DataRepresentationScale = this.renderOptions.series.x.scale
            .copy()
            .range([0, viewport.width]);

        const yScale: DataRepresentationScale = this.renderOptions.series.y.scale
            .copy()
            .range([viewport.height, 0]);

        if (chart.shouldRenderZeroLine) {
            let axisLine = d3.svg.line()
                .x((d: DataRepresentationPoint) => xScale.scale(d.x))
                .y(() => yScale.scale(0));

            this.zeroLineSelection
                .datum(series.points)
                .classed("hidden", false)
                .attr({
                    "d": axisLine as any
                });
        } else {
            this.zeroLineSelection.classed("hidden", true);
        }
    }

    public destroy(): void {
        super.destroy(this.dynamicComponents);

        this.zeroLineSelection.remove();

        super.destroy();

        this.dynamicComponents = null;
        this.components = null;
        this.dataBisector = null;
        this.lineComponent = null;
        this.axisComponent = null;
    }
}
