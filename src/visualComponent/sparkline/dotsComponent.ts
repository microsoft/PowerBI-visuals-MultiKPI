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

import { Selection } from "d3-selection";

import powerbi from "powerbi-visuals-api";
import { CssConstants } from "powerbi-visuals-utils-svgutils";

import {
    IDataRepresentationAxis,
    IDataRepresentationPoint,
} from "../../converter/data/dataRepresentation";

import { SparklineChartDescriptor } from "../../settings/descriptors/sparkline/sparklineChartDescriptor";

import { BaseComponent } from "../baseComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import { DataRepresentationScale } from "../../converter/data/dataRepresentationScale";

import { isValueValid } from "../../utils/valueUtils";

export interface IDotsComponentRenderOptions {
    viewport: powerbi.IViewport;
    x: IDataRepresentationAxis;
    y: IDataRepresentationAxis;
    points: IDataRepresentationPoint[];
    settings: SparklineChartDescriptor;
}

export class DotsComponent extends BaseComponent<IVisualComponentConstructorOptions, IDotsComponentRenderOptions> {
    private dotSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("dot");

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "dotsComponent",
            "g",
        );
    }

    public render(options: IDotsComponentRenderOptions): void {
        const {
            x,
            y,
            points,
            viewport,
            settings,
        } = options;

        const xScale: DataRepresentationScale = x.scale
            .copy()
            .range([0, viewport.width]);

        const yScale: DataRepresentationScale = y.scale
            .copy()
            .range([viewport.height, 0]);

        const dotSelection: Selection<any, IDataRepresentationPoint, any, any> = this.element
            .selectAll(this.dotSelector.selectorName)
            .data(points.filter((point: IDataRepresentationPoint) => {
                return point && isValueValid(point.y);
            }));

        dotSelection
            .exit()
            .remove();

        dotSelection
            .enter()
            .append("circle")
            .classed(this.dotSelector.className, true)
            .merge(dotSelection)
            .attr("cx", (point: IDataRepresentationPoint) => xScale.scale(point.x))
            .attr("cy", (point: IDataRepresentationPoint) => yScale.scale(point.y))
            .attr("r", settings.getRadius())
            .style("fill", settings.color);
    }

    public clear(): void {
        this.element
            .selectAll("*")
            .remove();
    }

    public destroy(): void {
        this.element = null;
    }
}
