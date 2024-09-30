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

import { Dispatch } from "d3-dispatch";
import { pointer as d3Mouse } from "d3-selection";

import { BaseContainerComponent } from "../baseContainerComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";
import { IVisualComponentRenderOptions } from "../visualComponentRenderOptions";

import { IVisualComponent } from "../visualComponent";

import { EventName } from "../../event/eventName";

import {
    ChartComponent,
    IChartComponentRenderOptions,
} from "./chartComponent";

import {
    ChartLabelComponent,
    IChartLabelComponentRenderOptions,
} from "./chartLabelComponent";

export type MainChartComponentsRenderOptions = IChartComponentRenderOptions | IChartLabelComponentRenderOptions;

export class MainChartComponent extends BaseContainerComponent<
    IVisualComponentConstructorOptions,
    IVisualComponentRenderOptions,
    MainChartComponentsRenderOptions
    > {
    private chart: IVisualComponent<IChartComponentRenderOptions>;
    private chartLabel: IVisualComponent<IChartLabelComponentRenderOptions>;

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "mainChartComponent",
        );

        this.constructorOptions = {
            ...options,
            element: this.element,
        };

        this.chart = new ChartComponent(this.constructorOptions);
        this.chartLabel = new ChartLabelComponent(this.constructorOptions);

        this.components = [
            this.chart,
            this.chartLabel,
        ];

        this.initMouseEvents();
    }

    public render(options: IVisualComponentRenderOptions): void {
        const { viewport } = options;

        this.updateSize(viewport.width, viewport.height);

        const data: IChartComponentRenderOptions = {
            series: options.data.series[0],
            settings: options.settings,
            viewport,
            viewportSize: options.data.viewportSize,
        };

        this.chart.render(data);

        this.chartLabel.render({
            dateSettings: options.settings.date,
            kpiSettings: options.settings.kpi,
            series: data.series,
            viewport,
        });
    }

    private initMouseEvents(): void {
        const eventDispatcher: Dispatch<any> = this.constructorOptions.eventDispatcher;

        function onMouseMove(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            eventDispatcher.call(EventName.onMouseMove, undefined, d3Mouse(event, this));
        }

        this.element.on("mousemove", onMouseMove);
        this.element.on("touchmove", onMouseMove);
        this.element.on("touchstart", onMouseMove);

        function onMouseOut(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            eventDispatcher.call(EventName.onMouseOut);
            eventDispatcher.call(EventName.onChartChangeStop);
            eventDispatcher.call(EventName.onChartViewReset);
        }

        this.element.on("mouseout", onMouseOut);
        this.element.on("mouseleave", onMouseOut);
        this.element.on("touchleave", onMouseOut);

        this.element.on("mouseenter", () => {
            this.constructorOptions.eventDispatcher.call(EventName.onChartChangeStop);
        });
    }
}
