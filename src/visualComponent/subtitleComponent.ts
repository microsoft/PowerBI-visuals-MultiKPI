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
import IViewport = powerbi.IViewport;

import { CssConstants } from "powerbi-visuals-utils-svgutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { BaseComponent } from "./baseComponent";
import { IVisualComponentConstructorOptions } from "./visualComponentConstructorOptions";
import { SubtitleBaseContainerItem } from "../settings/descriptors/subtitleBaseDescriptor";

export interface ISubtitleComponentRenderOptions {
    subtitleSettings: SubtitleBaseContainerItem;
    subtitle?: string;
}

export class SubtitleComponent extends BaseComponent<IVisualComponentConstructorOptions, ISubtitleComponentRenderOptions> {
    protected subtitleSelector: CssConstants.ClassAndSelector = this.getSelectorWithPrefix("subtitle");

    private className: string = "subtitleComponent";

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

    public render(options: ISubtitleComponentRenderOptions): void {
        const { subtitleSettings: settings, subtitle } = options;

        if (settings.shouldBeShown) {
            this.show();
            this.renderComponent(settings, subtitle);
        } else {
            this.hide();
        }
    }

    public getViewport(): IViewport {
        const height: number = this.element && this.isShown
            ? (<HTMLElement>(this.element.node())).clientHeight
            : 0;

        return {
            height,
            width: this.width,
        };
    }

    private renderComponent(settings: SubtitleBaseContainerItem, subtitle?: string): void {
        const subtitleSelection: Selection<any, any, any, any> = this.element
            .selectAll(this.subtitleSelector.selectorName)
            .data(settings.shouldBeShown ? [[]] : []);

        subtitleSelection
            .exit()
            .remove();
    
        const subtitleText: string = `${settings.titleText.value}${(subtitle ?? "")}`;

        subtitleSelection
            .enter()
            .append("div")
            .classed(this.subtitleSelector.className, true)
            .merge(subtitleSelection)
            .text(subtitleText)
            .style("text-align", settings.alignment.value);

        this.updateFormatting(this.element, settings);

        this.element
            .style("background-color", settings.backgroundColor.value.value)
            .style("padding-top", settings.paddingTop ?
                pixelConverter.toString(settings.paddingTop)
                : null,
            )
            .style("padding-bottom", settings.paddingBottom
                ? pixelConverter.toString(settings.paddingBottom)
                : null,
            );
    }
}
