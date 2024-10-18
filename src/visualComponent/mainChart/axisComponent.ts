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

import { axisRight } from "d3-axis";
import { ScaleLinear } from "d3-scale";
import { select as d3Select } from "d3-selection";

import powerbi from "powerbi-visuals-api";
import IViewport = powerbi.IViewport;

import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import {
    IDataRepresentationAxis,
    IDataRepresentationSeries,
} from "../../converter/data/dataRepresentation";

import { DataRepresentationScale } from "../../converter/data/dataRepresentationScale";

import { AxisBaseContainerItem } from "../../settings/descriptors/axisBaseDescriptor";

import { BaseComponent } from "../baseComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";
import { detectPrecision } from "../../converter/data/dataFormatter";

export interface IAxisComponentRenderOptions {
    viewport: IViewport;
    settings: AxisBaseContainerItem;
    series: IDataRepresentationSeries;
    y: IDataRepresentationAxis;
}

export class AxisComponent extends BaseComponent<IVisualComponentConstructorOptions, IAxisComponentRenderOptions> {
    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            "axisComponent",
            "g",
        );
    }

    public render(options: IAxisComponentRenderOptions): void {
        const { settings } = options;

        if (settings.shouldBeShown) {
            this.show();
            this.renderComponent(options);
        } else {
            this.hide();
        }
    }

    private renderComponent(options: IAxisComponentRenderOptions) {
        const {
            y,
            settings,
            viewport,
        } = options;

        const yScale: DataRepresentationScale = y.scale
            .copy()
            .range([viewport.height, 0]);

        const domain: number[] = <number[]>(yScale.getDomain());

        const axisValueFormatter: valueFormatter.IValueFormatter = valueFormatter.create({
            displayUnitSystemType: 2,
            format: settings.getFormat(),
            precision: detectPrecision(domain[1] || domain[0], settings),
            value: settings.displayUnits.value || domain[1] || domain[0],
        });

        const yAxis: (selection) => void = axisRight(<ScaleLinear<number, number>>(yScale.getScale()))
            .tickValues(domain)
            .tickFormat((value: number) => {
                return axisValueFormatter.format(value);
            });

        this.element.call(yAxis);

        this.element
            .selectAll(".tick text")
            .each(function enumerateEachTextTick(_, elementIndex: number) {
                d3Select(this)
                    .attr("x", settings.axisLabelX)
                    .attr("y", elementIndex
                        ? settings.axisLabelY
                        : -settings.axisLabelY)
                    .style("fill", settings.color.value.value)
                    .style("font-weight", settings.isBold.value ? "bold" : "normal")
                    .style("font-style", settings.isItalic.value ? "italic" : "normal")
                    .style("text-decoration", settings.isUnderlined.value ? "underline" : "none")
            });

        this.updateFormatting(this.element, settings);
    }
}
