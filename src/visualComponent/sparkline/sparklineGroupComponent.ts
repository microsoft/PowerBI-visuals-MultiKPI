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

import { IMargin } from "powerbi-visuals-utils-svgutils";

import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { BaseContainerComponent } from "../baseContainerComponent";
import { IVisualComponent } from "../visualComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";
import { IVisualComponentRenderOptions } from "../visualComponentRenderOptions";

import {
    ISparklineComponentRenderOptions,
    SparklineComponent,
} from "./sparklineComponent";

import { IDataRepresentationSeries } from "../../converter/data/dataRepresentation";

export class SparklineGroupComponent
    extends BaseContainerComponent<IVisualComponentConstructorOptions, IVisualComponentRenderOptions, ISparklineComponentRenderOptions> {
    private className: string = "sparklineGroupComponent";

    private minAmountOfSeries: number = 1;

    private padding: IMargin = {
        bottom: 0,
        left: 8,
        right: 0,
        top: 5,
    };

    private renderingDelay: number = 10;
    private renderingTimers: number[] = [];

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(options.element, this.className);

        this.constructorOptions = {
            ...options,
            element: this.element,
        };
    }

    public render(options: IVisualComponentRenderOptions): void {
        this.renderOptions = options;

        const {
            data: { series },
            settings: { grid },
        } = this.renderOptions;

        const seriesLength: number = series.length;

        const amountOfComponents: number = isNaN(grid.columns.value) || !grid.columns.value
            ? seriesLength
            : grid.columns.value;

        this.element.style(
            "padding",
            `${pixelConverter.toString(this.padding.top)} 0 ${pixelConverter.toString(this.padding.bottom)} 0`,
        );

        this.initComponents(
            this.components,
            amountOfComponents,
            (componentIndex: number) => {
                return new SparklineComponent({
                    ...this.constructorOptions,
                    id: componentIndex,
                });
            },
        );

        const paddingWidth: number = amountOfComponents > this.minAmountOfSeries
            ? this.padding.left * (amountOfComponents - 1)
            : 0;

        const height: number = Math.max(0, options.viewport.height - this.padding.top - this.padding.bottom);
        const width: number = Math.max(0, (options.viewport.width - paddingWidth) / amountOfComponents);

        this.forEach(
            this.components,
            (component: IVisualComponent<ISparklineComponentRenderOptions>, componentIndex: number) => {
                const data: IDataRepresentationSeries = series[componentIndex];

                const position: number = data?.settings?.sparkline.position.value
                    ? data.settings.sparkline.position.value
                    : data
                        ? data.index
                        : componentIndex;

                this.renderComponent<ISparklineComponentRenderOptions>(
                    component,
                    {
                        current: data,
                        dataRepresentation: options.data,
                        position,
                        series: [data],
                        viewport: { height, width },
                    },
                    componentIndex,
                );
            },
        );
    }

    private renderComponent<RenderOptions>(
        component: IVisualComponent<RenderOptions>,
        options: RenderOptions,
        index: number,
    ) {
        if (this.renderingTimers[index]) {
            clearTimeout(this.renderingTimers[index]);
        }

        this.renderingTimers[index] = <number>(<unknown>setTimeout(
            component.render.bind(component, options),
            this.renderingDelay,
        ));
    }
}
