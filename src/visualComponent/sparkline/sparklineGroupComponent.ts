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

export class SparklineGroupComponent extends BaseContainerComponent<VisualComponentConstructorOptions, VisualComponentRenderOptions, SparklineComponentRenderOptions> {
    private className: string = "sparklineGroupComponent";

    private minAmountOfSeries: number = 1;

    private padding: IMargin = {
        top: 5,
        right: 0,
        bottom: 0,
        left: 8,
    };

    private renderingDelay: number = 10;
    private renderingTimers: number[] = [];

    constructor(options: VisualComponentConstructorOptions) {
        super();

        this.initElement(options.element, this.className);

        this.constructorOptions = {
            ...options,
            element: this.element,
        };
    }

    public render(options: VisualComponentRenderOptions): void {
        this.renderOptions = options;

        const {
            data: { series },
            settings: { grid },
        } = this.renderOptions;

        const seriesLength: number = series.length;

        const amountOfComponents: number = isNaN(grid.columns) || !grid.columns
            ? seriesLength
            : grid.columns;

        this.element.style(
            "padding",
            `${PixelConverter.toString(this.padding.top)} 0 ${PixelConverter.toString(this.padding.bottom)} 0`
        );

        this.initComponents(
            this.components,
            amountOfComponents,
            (componentIndex: number) => {
                return new SparklineComponent({
                    ...this.constructorOptions,
                    id: componentIndex,
                });
            }
        );

        const paddingWidth: number = amountOfComponents > this.minAmountOfSeries
            ? this.padding.left * (amountOfComponents - 1)
            : 0;

        const height: number = Math.max(0, options.viewport.height - this.padding.top - this.padding.bottom);
        const width: number = Math.max(0, (options.viewport.width - paddingWidth) / amountOfComponents);

        this.forEach(
            this.components,
            (component: VisualComponent<SparklineComponentRenderOptions>, componentIndex: number) => {
                const data: DataRepresentationSeries = series[componentIndex];

                const position: number = data && data.settings.sparkline.position
                    ? data.settings.sparkline.position
                    : data
                        ? data.index
                        : componentIndex;

                this.renderComponent<SparklineComponentRenderOptions>(
                    component,
                    {
                        position,
                        current: data,
                        series: [data],
                        viewport: { height, width },
                        dataRepresentation: options.data,
                    },
                    componentIndex,
                );
            }
        );
    }

    private renderComponent<RenderOptions>(
        component: VisualComponent<RenderOptions>,
        options: RenderOptions,
        index: number
    ) {
        if (this.renderingTimers[index]) {
            clearTimeout(this.renderingTimers[index]);
        }

        this.renderingTimers[index] = setTimeout(
            component.render.bind(component, options),
            this.renderingDelay
        );
    }
}
f
