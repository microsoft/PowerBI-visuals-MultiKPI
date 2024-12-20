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

import { bisector } from "d3-array";
import { Selection as d3Selection, BaseType } from "d3-selection";
import { line } from "d3-shape";
type Selection = d3Selection<BaseType, unknown, BaseType, unknown>;

import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;

import { IMargin } from "powerbi-visuals-utils-svgutils";

import {
    IDataRepresentationPoint,
    IDataRepresentationSeries,
    ViewportSize,
    DataRepresentationPointGradientType,
} from "../../converter/data/dataRepresentation";

import { DataRepresentationScale } from "../../converter/data/dataRepresentationScale";

import { ChartDescriptor } from "../../settings/descriptors/chartDescriptor";
import { Settings } from "../../settings/settings";

import {
    ILineComponentRenderOptions,
    LineComponent,
} from "../sparkline/lineComponent";

import {
    AxisComponent,
    IAxisComponentRenderOptions,
} from "./axisComponent";

import { BaseContainerComponent } from "../baseContainerComponent";
import { IVisualComponent } from "../visualComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import { IHoverLabelComponentRenderOptions } from "./hoverLabelComponent";

import { EventName } from "../../event/eventName";

import {
    IVerticalReferenceLineComponentRenderOptions,
    VerticalReferenceLineComponent,
} from "../verticalReferenceLineComponent";

import { HoverLabelComponent } from "./hoverLabelComponent";

export interface IZeroLineRenderOptions {
    series: IDataRepresentationSeries;
    chart: ChartDescriptor;
    viewport: IViewport;
}

export interface IChartComponentRenderOptions {
    series: IDataRepresentationSeries;
    viewport: IViewport;
    settings: Settings;
    viewportSize: ViewportSize;
}

export interface IChartComponentInnerRenderOptions extends ILineComponentRenderOptions {
    settings: ChartDescriptor;
}

export type RootComponentsRenderOptions = IHoverLabelComponentRenderOptions | IAxisComponentRenderOptions | ILineComponentRenderOptions;

export class ChartComponent extends BaseContainerComponent<
    IVisualComponentConstructorOptions,
    IChartComponentRenderOptions,
    RootComponentsRenderOptions
    > {
    private dataBisector = bisector((d: IDataRepresentationPoint) => d.x).left;

    private className: string = "chartComponent";

    private zeroLineSelection: Selection;

    private axisComponent: IVisualComponent<IAxisComponentRenderOptions>;
    private lineComponent: IVisualComponent<ILineComponentRenderOptions>;

    private dynamicComponents: IVisualComponent<IHoverLabelComponentRenderOptions>[] = [];

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

                this.constructorOptions.eventDispatcher.call(
                    EventName.onCurrentDataPointIndexChange,
                    undefined,
                    index,
                );
            });

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onMouseOut}.${this.className}`,
            () => {
                const latestDataPoint: IDataRepresentationPoint = this.renderOptions?.series?.current;

                this.constructorOptions.eventDispatcher.call(
                    EventName.onCurrentDataPointIndexReset,
                    undefined,
                    latestDataPoint
                        ? latestDataPoint.index
                        : NaN,
                );
            },
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

    public render(options: IChartComponentRenderOptions): void {
        this.renderOptions = options;

        const {
            series,
            settings,
            viewport,
        } = options;

        viewport.width -= 10;

        this.hideComponents();
        this.updateSize(viewport.width, viewport.height);

        if (!series) {
            this.hide();
        } else {
            this.show();
        }

        this.renderZeroLine({
            chart: settings.chart,
            series,
            viewport,
        });

        this.lineComponent.render({
            alternativeColor: settings.chart.alternativeColor.value.value,
            color: settings.chart.color.value.value,
            current: series.current,
            isLine: series.isLine,
            points: series.points,
            thickness: settings.chart.thickness,
            type: series.isLine ? DataRepresentationPointGradientType.line : DataRepresentationPointGradientType[settings.chart.chartType.value.value],
            viewport,
            x: series.x,
            y: series.y,
        });

        const margin: IMargin = this.getMarginByThickness(settings.chart.thickness);

        this.updateMargin(this.element, margin);

        this.axisComponent.render({
            series,
            settings: series.settings.yAxis,
            viewport,
            y: series.y,
        });
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

    private hideComponents(): void {
        this.forEach(
            this.dynamicComponents,
            (component: IVisualComponent<IVerticalReferenceLineComponentRenderOptions>) => {
                component.hide();
            });
    }

    private getDataPointIndexByPosition(position: number): number {
        if (!this.renderOptions || !this.renderOptions.series) {
            return NaN;
        }

        const areaScale: IViewport = this.constructorOptions.scaleService.getScale();

        const width: number = this.width;

        const scale: DataRepresentationScale = this.renderOptions.series.x.scale
            .copy()
            .range([0, width]);

        const thickness: number = this.renderOptions.settings.chart.thickness;

        const leftPosition: number = (position - thickness) / areaScale.width;

        const x: Date = <Date>(scale.invert(leftPosition));

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

        let dataPoint: IDataRepresentationPoint = this.renderOptions.series.points[index];

        if (!dataPoint) {
            dataPoint = this.renderOptions.series.points[this.renderOptions.series.points.length - 1];
        }

        const data: IHoverLabelComponentRenderOptions = {
            dataPoint,
            dateSettings: this.renderOptions.settings.date,
            kpiOnHoverSettings: this.renderOptions.settings.kpiOnHover,
            kpiSettings: this.renderOptions.settings.kpi,
            offset: 0,
            series: this.renderOptions.series,
            varianceSettings: this.renderOptions.series.settings.variance,
            viewport: { width: this.width, height: this.height },
        };

        this.forEach(
            this.dynamicComponents,
            (component: IVisualComponent<IVerticalReferenceLineComponentRenderOptions>) => {
                component.show();

                component.render(data);
            },
        );
    }

    private renderZeroLine(options: IZeroLineRenderOptions) {
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

        if (chart.shouldRenderZeroLine.value) {
            const axisLine = line<IDataRepresentationPoint>()
                .x((d: IDataRepresentationPoint) => xScale.scale(d.x))
                .y(() => yScale.scale(0));

            this.zeroLineSelection
                .datum(series.points)
                .classed("hidden", false)
                .attr("d", axisLine);
        } else {
            this.zeroLineSelection.classed("hidden", true);
        }
    }
}
