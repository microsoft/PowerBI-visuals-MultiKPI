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

import { CssConstants } from "powerbi-visuals-utils-svgutils";

import { StaleDataDescriptor } from "../settings/descriptors/staleDataDescriptor";
import { SubtitleWarningDescriptor } from "../settings/descriptors/subtitleWarningDescriptor";
import { IVisualComponentConstructorOptions } from "./visualComponentConstructorOptions";

import {
    ISubtitleComponentRenderOptions,
    SubtitleComponent,
} from "./subtitleComponent";

export interface ISubtitleWarningComponentRenderOptions extends ISubtitleComponentRenderOptions {
    warningState: number;
    dateDifference: number;
    subtitleSettings: SubtitleWarningDescriptor;
    staleDataSettings: StaleDataDescriptor;
}

interface IIcon {
    backgroundColor?: string;
    color?: string;
    isShown: boolean;
    selector: CssConstants.ClassAndSelector;
    title?: string;
}

export class SubtitleWarningComponent extends SubtitleComponent {
    private warningSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("warning");
    private dataAgeSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("dataAge");

    constructor(options: IVisualComponentConstructorOptions) {
        super(options);

        this.element.classed(this.getClassNameWithPrefix("subtitleWarningComponent"), true);
    }

    public render(options: ISubtitleWarningComponentRenderOptions): void {
        const {
            staleDataSettings,
            subtitleSettings,
            warningState,
            dateDifference,
        } = options;

        this.renderIcon({
            backgroundColor: null,
            color: null,
            isShown: !!(warningState > 0 && subtitleSettings.warningText),
            selector: this.warningSelector,
            title: subtitleSettings.warningText,
        });

        super.render(options);

        this.renderStaleData(dateDifference, staleDataSettings);
    }

    private renderStaleData(dateDifference: number, staleDataSettings: StaleDataDescriptor): void {
        const {
            background,
            color,
            shouldBeShown,
            staleDataText,
            staleDataThreshold,
        } = staleDataSettings;

        const title: string = this.getTitle(
            staleDataText,
            dateDifference,
        );

        const isDataStale: boolean = this.isDataStale(
            dateDifference,
            staleDataThreshold,
        );

        this.renderIcon({
            backgroundColor: background,
            color,
            isShown: shouldBeShown && isDataStale,
            selector: this.dataAgeSelector,
            title,
        });
    }

    private isDataStale(dateDifference: number, staleDataThreshold: number): boolean {
        return dateDifference > staleDataThreshold;
    }

    private getTitle(stringTemplate: string, dateDifference: number): string {
        return stringTemplate && stringTemplate.replace
            ? stringTemplate.replace("${1}", `${dateDifference}`)
            : stringTemplate;
    }

    private renderIcon({
        backgroundColor,
        color,
        isShown,
        selector,
        title,
    }: IIcon): void {
        const iconSelection: Selection<any, string, any, any> = this.element
            .selectAll(selector.selectorName)
            .data(isShown ? [title] : []);

        iconSelection
            .exit()
            .remove();

        iconSelection
            .enter()
            .append("div")
            .classed(selector.className, true)
            .merge(iconSelection)
            .attr("title", (titleData: string) => titleData)
            .style("color", color || null)
            .style("background-color", backgroundColor || null);
    }
}
