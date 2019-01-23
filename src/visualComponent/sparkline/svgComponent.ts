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

export class SvgComponent extends BaseContainerComponent<VisualComponentConstructorOptions, SparklineComponentRenderOptions, VisualComponentRenderOptionsBase> {
    private className: string = "svgComponentContainer";

    private multiLineComponent: VisualComponent<SparklineComponentRenderOptions>;
    private axisComponent: VisualComponent<AxisComponentRenderOptions>;

    private dynamicComponents: VisualComponent<DotsComponentRenderOptions>[] = [];

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
        };

        this.multiLineComponent = new MultiLineComponent(this.constructorOptions);
        this.axisComponent = new AxisComponent(this.constructorOptions);

        this.components = [
            this.multiLineComponent,
            this.axisComponent,
        ];

        this.dynamicComponents = [
            new DotsComponent(this.constructorOptions),
        ];

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexChange}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this)
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexReset}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this)
        );

        this.element.on("mouseenter", () => {
            this.constructorOptions.eventDispatcher[EventName.onChartChangeHover](
                this.renderOptions && this.renderOptions.current && this.renderOptions.current.name
            );
        });
    }

    private onCurrentDataPointIndexChange(index: number): void {
        if (this.renderOptions
            && this.renderOptions.series
            && this.renderOptions.current
            && index !== undefined
            && index !== null
            && !isNaN(index)
        ) {
            const points: DataRepresentationPoint[] = [];

            this.renderOptions.series.forEach((series: DataRepresentationSeries) => {
                if (series
                    && series.smoothedPoints
                    && series.smoothedPoints[index]
                ) {
                    points.push(series.smoothedPoints[index]);
                }
            });

            this.forEach(
                this.dynamicComponents,
                (component: VisualComponent<DotsComponentRenderOptions>) => {
                    component.render({
                        points,
                        x: this.renderOptions.current.x,
                        y: this.renderOptions.current.ySparkline,
                        viewport: this.renderOptions.viewport,
                        settings: this.renderOptions.current.settings.sparklineChart,
                    });
                }
            );
        }
    }

    public render(options: SparklineComponentRenderOptions): void {
        const maxThickness: number = !options || !options.series
            ? 0
            : options.series.reduce((previousValue: number, series: DataRepresentationSeries) => {
                return Math.max(previousValue, series.settings.sparklineChart.getRadius());
            }, 0);

        const margin: IMargin = this.getMarginByThickness(maxThickness);

        const viewport: IViewport = {
            width: Math.max(0, options.viewport.width - margin.left - margin.right),
            height: Math.max(0, options.viewport.height - margin.top - margin.bottom),
        };

        this.renderOptions = {
            ...options,
            viewport,
        };

        this.updateSize(
            options.viewport.width,
            options.viewport.height,
        );

        this.updateMargin(this.element, margin);

        this.multiLineComponent.render(this.renderOptions);

        this.axisComponent.render({
            series: this.renderOptions.current,
            viewport: this.renderOptions.viewport,
            y: this.renderOptions.current.ySparkline,
            settings: this.renderOptions.current.settings.sparklineYAxis,
        });

        this.onCurrentDataPointIndexChange(
            this.renderOptions
            && this.renderOptions.current
            && this.renderOptions.current.current
            && this.renderOptions.current.current.index
        );
    }

    public destroy(): void {
        super.destroy(this.components);
        super.destroy(this.dynamicComponents);

        this.axisComponent = null;
        this.multiLineComponent = null;
    }
}
