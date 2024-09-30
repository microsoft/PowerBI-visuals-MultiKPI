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

import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;

import { IMargin } from "powerbi-visuals-utils-svgutils";

import {
    IDataRepresentationPoint,
    IDataRepresentationSeries,
} from "../../converter/data/dataRepresentation";

import { BaseContainerComponent } from "../baseContainerComponent";
import { IVisualComponent } from "../visualComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import {
    AxisComponent,
    IAxisComponentRenderOptions,
} from "../mainChart/axisComponent";

import { ISparklineComponentRenderOptions } from "./sparklineComponent";

import {
    DotsComponent,
    IDotsComponentRenderOptions,
} from "./dotsComponent";

import { EventName } from "../../event/eventName";
import { MultiLineComponent } from "./multiLineComponent";

import { isValueValid } from "../../utils/isValueValid";

type SvgComponentsRenderOptions = ISparklineComponentRenderOptions | IAxisComponentRenderOptions | IDotsComponentRenderOptions;
export class SvgComponent extends BaseContainerComponent<
    IVisualComponentConstructorOptions,
    ISparklineComponentRenderOptions,
    SvgComponentsRenderOptions
    > {
    private className: string = "svgComponentContainer";

    private multiLineComponent: IVisualComponent<ISparklineComponentRenderOptions>;
    private axisComponent: IVisualComponent<IAxisComponentRenderOptions>;

    private dynamicComponents: IVisualComponent<IDotsComponentRenderOptions>[] = [];

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className,
            "svg",
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
            this.onCurrentDataPointIndexChange.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexReset}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this),
        );

        this.element.on("mouseenter", (event) => {
            this.constructorOptions.eventDispatcher.call(
                EventName.onChartChangeHover,
                undefined,
                event,
                this.renderOptions && this.renderOptions.current && this.renderOptions.current.name
            );
        });
    }

    public render(options: ISparklineComponentRenderOptions): void {
        const maxThickness: number = !options || !options.series
            ? 0
            : options.series.reduce((previousValue: number, series: IDataRepresentationSeries) => {
                return Math.max(previousValue, series.settings.sparklineChart.getRadius());
            }, 0);

        const margin: IMargin = this.getMarginByThickness(maxThickness);

        const viewport: IViewport = {
            height: Math.max(0, options.viewport.height - margin.top - margin.bottom),
            width: Math.max(0, options.viewport.width - margin.left - margin.right),
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
            settings: this.renderOptions.current.settings.sparklineYAxis,
            viewport: this.renderOptions.viewport,
            y: this.renderOptions.current.ySparkline,
        });

        this.onCurrentDataPointIndexChange(
            this.renderOptions
            && this.renderOptions.current
            && this.renderOptions.current.current
            && this.renderOptions.current.current.index,
        );
    }

    public destroy(): void {
        super.destroy(this.components);
        super.destroy(this.dynamicComponents);

        this.axisComponent = null;
        this.multiLineComponent = null;
    }

    private onCurrentDataPointIndexChange(index: number): void {
        if (this.renderOptions
            && this.renderOptions.series
            && this.renderOptions.current
            && index !== undefined
            && index !== null
            && !isNaN(index)
        ) {
            const points: IDataRepresentationPoint[] = [];

            this.renderOptions.series.forEach((series: IDataRepresentationSeries) => {
                const point: IDataRepresentationPoint = this.getClosestValidPoint(
                    series.smoothedPoints,
                    index,
                );

                if (point) {
                    points.push(point);
                }
            });

            this.forEach(
                this.dynamicComponents,
                (component: IVisualComponent<IDotsComponentRenderOptions>) => {
                    component.render({
                        points,
                        settings: this.renderOptions.current.settings.sparklineChart,
                        viewport: this.renderOptions.viewport,
                        x: this.renderOptions.current.x,
                        y: this.renderOptions.current.ySparkline,
                    });
                },
            );
        }
    }

    private getClosestValidPoint(
        points: IDataRepresentationPoint[],
        pointIndex: number,
    ): IDataRepresentationPoint {
        if (points
            && points.length
            && pointIndex < points.length
        ) {
            for (let index = pointIndex; index >= 0; index--) {
                const point: IDataRepresentationPoint = points[index];

                if (point && isValueValid(point.y)) {
                    return point;
                }
            }
        }

        return null;
    }
}
