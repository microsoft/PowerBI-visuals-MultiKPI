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

import powerbiVisualsApi from "powerbi-visuals-api";

import { Selection } from "d3-selection";

import { CssConstants } from "powerbi-visuals-utils-svgutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { BaseComponent } from "../baseComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;

export interface IRenderGroup {
    data: string;
    isShown: boolean;
    color?: string;
    selector?: CssConstants.ClassAndSelector;
    fontSizeInPt?: number;
    tooltipDataItems?: VisualTooltipDataItem[];
}

export abstract class ChartLabelBaseComponent<RenderOptions> extends BaseComponent<IVisualComponentConstructorOptions, RenderOptions> {
    protected className: string = "chartLabelBaseComponent";

    protected headerSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_header`);
    protected bodySelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_body`);
    protected footerSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_footer`);

    protected varianceNotAvailableSelector: CssConstants.ClassAndSelector
        = this.getSelectorWithPrefix(`${this.className}_body_variance_na`);

    private itemSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix(`${this.className}_items`);

    constructor(options: IVisualComponentConstructorOptions) {
        super();

        this.initElement(
            options.element,
            this.className,
        );

        this.constructorOptions = {
            ...options,
            element: this.element,
        };
    }

    protected renderGroup(
        selector: CssConstants.ClassAndSelector,
        renderGroupData: IRenderGroup[],
    ): void {
        const selection: Selection<any, IRenderGroup[], any, any> = this.element
            .selectAll(selector.selectorName)
            .data([renderGroupData]);

        selection
            .exit()
            .remove();

        const mergedSelection = selection
            .enter()
            .append("div")
            .classed(selector.className, true)
            .merge(selection);

        const itemSelection: Selection<any, IRenderGroup, any, any> = mergedSelection
            .selectAll(this.itemSelector.selectorName)
            .data((data: IRenderGroup[]) => {
                return data.filter((renderGroup: IRenderGroup) => {
                    return renderGroup && renderGroup.isShown;
                });
            });

        itemSelection
            .exit()
            .remove();

        itemSelection
            .enter()
            .append("div")
            .merge(itemSelection)
            .attr("class", (data: IRenderGroup) => {
                const baseSelector: string = this.itemSelector.className;

                return data.selector
                    ? `${baseSelector} ${data.selector.className}`
                    : baseSelector;
            })
            .text((data: IRenderGroup) => data.data)
            .style("color", (data: IRenderGroup) => data.color)
            .style("font-size", (data: IRenderGroup) => {
                if (!data.fontSizeInPt || isNaN(data.fontSizeInPt)) {
                    return null;
                }

                const fontSizeInPx: number = pixelConverter.fromPointToPixel(data.fontSizeInPt);

                return pixelConverter.toString(fontSizeInPx);
            });

        this.constructorOptions.tooltipServiceWrapper.addTooltip<IRenderGroup>(
            itemSelection,
            (args) => {
                if (args.data.tooltipDataItems) {
                    return args.data.tooltipDataItems;
                }
            });
    }
}
