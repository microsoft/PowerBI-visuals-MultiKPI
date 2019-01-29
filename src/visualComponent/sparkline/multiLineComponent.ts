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

import { BaseContainerComponent } from "../baseContainerComponent";
import { IVisualComponent } from "../visualComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import {
    DataRepresentationPointGradientType,
    IDataRepresentationSeries,
} from "../../converter/data/dataRepresentation";

import {
    ILineComponentRenderOptions,
    LineComponent,
} from "./lineComponent";

import { ISparklineComponentRenderOptions } from "./sparklineComponent";

export class MultiLineComponent
    extends BaseContainerComponent<IVisualComponentConstructorOptions, ISparklineComponentRenderOptions, ILineComponentRenderOptions> {
    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "multiLineComponent",
            "g",
        );

        this.constructorOptions = {
            ...options,
            element: this.element,
        };
    }

    public render(options: ISparklineComponentRenderOptions): void {
        this.renderOptions = options;

        const {
            series,
            viewport,
        } = this.renderOptions;

        this.initComponents(
            this.components,
            series.length,
            () => {
                return new LineComponent(this.constructorOptions);
            },
        );

        this.forEach(
            this.components,
            (component: IVisualComponent<ILineComponentRenderOptions>, componentIndex: number) => {
                const currentSeries: IDataRepresentationSeries = series[componentIndex];

                component.render({
                    alternativeColor: currentSeries.settings.sparklineChart.alternativeColor,
                    color: currentSeries.settings.sparklineChart.color,
                    points: currentSeries.smoothedPoints,
                    thickness: currentSeries.settings.sparklineChart.thickness,
                    type: DataRepresentationPointGradientType.line,
                    viewport,
                    x: currentSeries.x,
                    y: currentSeries.ySparkline,
                });
            },
        );
    }
}
