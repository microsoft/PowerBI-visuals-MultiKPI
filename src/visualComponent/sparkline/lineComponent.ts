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

import {
    area,
    Area,
    line,
    Line,
} from "d3-shape";

import { Selection } from "d3-selection";

import powerbi from "powerbi-visuals-api";

import { CssConstants } from "powerbi-visuals-utils-svgutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { BaseComponent } from "../baseComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import {
    DataRepresentationPointGradientType,
    IDataRepresentationAxis,
    IDataRepresentationPoint,
} from "../../converter/data/dataRepresentation";

import { DataRepresentationScale } from "../../converter/data/dataRepresentationScale";
import { EventName } from "../../event/eventName";

import { isValueValid } from "../../utils/valueUtils";

export interface ILineComponentRenderOptions {
    alternativeColor: string;
    color: string;
    filteredPoints: IDataRepresentationPoint[];
    points: IDataRepresentationPoint[];
    thickness: number;
    type: DataRepresentationPointGradientType;
    viewport: powerbi.IViewport;
    x: IDataRepresentationAxis;
    y: IDataRepresentationAxis;
}

export interface ILineComponentGradient {
    color: string;
    offset: string;
}

export class LineComponent extends BaseComponent<IVisualComponentConstructorOptions, ILineComponentRenderOptions> {
    private className: string = "lineComponent";
    private lineSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("line");

    private gradientId: string = `${this.className}_gradient${this.getId()}`;
    private gradientSelection: Selection<any, any, any, any>;

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className,
            "g",
        );

        this.gradientSelection = this.element
            .append("defs")
            .append("linearGradient")
            .attr("id", this.gradientId);

        this.constructorOptions = {
            ...options,
            element: this.element,
        };

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexChange}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onCurrentDataPointIndexReset}.${this.className}.${this.constructorOptions.id}`,
            this.onCurrentDataPointIndexChange.bind(this),
        );
    }

    public render(options: ILineComponentRenderOptions): void {
        this.renderOptions = options;

        this.renderComponent(this.renderOptions);
    }

    public destroy(): void {
        this.gradientSelection.remove();
        this.gradientSelection = null;

        super.destroy();
    }

    private onCurrentDataPointIndexChange(index: number): void {
        if (!this.renderOptions || !this.renderOptions.points) {
            return;
        }

        const point: IDataRepresentationPoint = this.renderOptions.points[index];

        if (!point) {
            return;
        }

        const {
            alternativeColor,
            color,
            filteredPoints,
            viewport,
        } = this.renderOptions;

        // Last valid point is required here to line width to generate a correct gradient
        const lastValidPoint: IDataRepresentationPoint = filteredPoints
            && filteredPoints[filteredPoints.length - 1];

        if (!lastValidPoint) {
            return;
        }

        const xScale: DataRepresentationScale = this.renderOptions.x.scale
            .copy()
            .range([0, viewport.width]);

        const xPosition: number = xScale.scale(point.x);

        const lineWidth: number = xScale.scale(lastValidPoint.x);

        const width: number = lineWidth > viewport.width
            ? viewport.width
            : lineWidth;

        const offset: number = xPosition / width * 100;
        const offsetInPercent: string = `${offset}%`;

        const gradients: ILineComponentGradient[] = offset === 100
            ? [
                {
                    color,
                    offset: "100%",
                },
            ]
            : [
                {
                    color: alternativeColor,
                    offset: "0%",
                },
                {
                    color: alternativeColor,
                    offset: offsetInPercent,
                },
                {
                    color,
                    offset: offsetInPercent,
                },
                {
                    color,
                    offset: "100%",
                },
            ];

        this.updateGradient(gradients);
    }

    private renderComponent(options: ILineComponentRenderOptions): void {
        const {
            x,
            y,
            viewport,
            color,
        } = options;

        this.updateGradient([{
            color,
            offset: "100%",
        }]);

        const xScale: DataRepresentationScale = x.scale
            .copy()
            .range([0, viewport.width]);

        const yScale: DataRepresentationScale = y.scale
            .copy()
            .range([viewport.height, 0]);

        const lineSelection = this.element
            .selectAll(this.lineSelector.selectorName)
            .data([options]);

        lineSelection
            .exit()
            .remove();

        lineSelection.enter()
            .append("svg:path")
            .classed(this.lineSelector.className, true)
            .merge(lineSelection)
            .attr("d", (lineRenderOptions: ILineComponentRenderOptions) => {
                const filteredPoints: IDataRepresentationPoint[] = this.filterPoints(lineRenderOptions.points);

                switch (lineRenderOptions.type) {
                    case DataRepresentationPointGradientType.area: {
                        return this.getArea(xScale, yScale, viewport)(filteredPoints);
                    }
                    case DataRepresentationPointGradientType.line:
                    default: {
                        return this.getLine(xScale, yScale)(filteredPoints);
                    }
                }
            })
            .style("fill", (lineRenderOptions: ILineComponentRenderOptions) => {
                switch (lineRenderOptions.type) {
                    case DataRepresentationPointGradientType.area: {
                        return this.getGradientUrl();
                    }
                    case DataRepresentationPointGradientType.line:
                    default: {
                        return null;
                    }
                }
            })
            .style("stroke", (lineRenderOptions: ILineComponentRenderOptions) => {
                switch (lineRenderOptions.type) {
                    case DataRepresentationPointGradientType.area: {
                        return null;
                    }
                    case DataRepresentationPointGradientType.line:
                    default: {
                        return this.getGradientUrl();
                    }
                }
            })
            .style("stroke-width", (lineRenderOptions: ILineComponentRenderOptions) => {
                switch (lineRenderOptions.type) {
                    case DataRepresentationPointGradientType.area: {
                        return null;
                    }
                    case DataRepresentationPointGradientType.line:
                    default: {
                        return pixelConverter.toString(lineRenderOptions.thickness);
                    }
                }
            });
    }

    private getLine(
        xScale: DataRepresentationScale,
        yScale: DataRepresentationScale,
    ): Line<IDataRepresentationPoint> {
        return line<IDataRepresentationPoint>()
            .x((data: IDataRepresentationPoint) => {
                return xScale.scale(data.x);
            })
            .y((data: IDataRepresentationPoint) => {
                return yScale.scale(data.y);
            });
    }

    private getArea(
        xScale: DataRepresentationScale,
        yScale: DataRepresentationScale,
        viewport: powerbi.IViewport,
    ): Area<IDataRepresentationPoint> {
        return area<IDataRepresentationPoint>()
            .x((dataPoint: IDataRepresentationPoint) => {
                return xScale.scale(dataPoint.x);
            })
            .y0(viewport.height)
            .y1((dataPoint: IDataRepresentationPoint) => {
                return yScale.scale(dataPoint.y);
            });
    }

    private filterPoints(points: IDataRepresentationPoint[]): IDataRepresentationPoint[] {
        return points.filter((point: IDataRepresentationPoint) => {
            return point && isValueValid(point.y);
        });
    }

    private getGradientUrl(): string {
        const href: string = window.location.href;

        return `url(${href}#${this.gradientId})`;
    }

    private updateGradient(gradients: ILineComponentGradient[]): void {
        if (!this.gradientSelection) {
            return;
        }

        const stopSelection: Selection<any, ILineComponentGradient, any, any> = this.gradientSelection
            .selectAll("stop")
            .data(gradients);

        stopSelection
            .exit()
            .remove();

        stopSelection
            .enter()
            .append("stop")
            .merge(stopSelection)
            .attr("offset", (gradient: ILineComponentGradient) => gradient.offset)
            .style("stop-color", (gradient: ILineComponentGradient) => gradient.color)
            .style("stop-opacity", 1);
    }

    private getId(): string {
        const crypto: Crypto = window.crypto || (window as any).msCrypto;
        const generatedIds: Uint32Array = new Uint32Array(2);

        crypto.getRandomValues(generatedIds);

        let concatenatedGeneratedId: string = "";

        /**
         * IE11 does not support Array method for Uint32Array
         * This is why we use for loop
         */

        // tslint:disable:prefer-for-of
        for (let index: number = 0; index < generatedIds.length; index++) {
            concatenatedGeneratedId += `${generatedIds[index]}`;
        }
        // tslint:enable:prefer-for-of

        return concatenatedGeneratedId;
    }
}
