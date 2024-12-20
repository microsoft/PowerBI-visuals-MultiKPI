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

import {
    CssConstants,
    IMargin,
} from "powerbi-visuals-utils-svgutils";

import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import { Selection as d3Selection, BaseType } from "d3-selection";
type Selection = d3Selection<BaseType, unknown, BaseType, unknown>;

import { IVisualComponent } from "./visualComponent";

import { TextFormattingDescriptor } from "../settings/descriptors/textFormattingDescriptor";

export abstract class BaseComponent<ConstructorOptionsType, RenderOptionsType> implements IVisualComponent<RenderOptionsType> {
    protected hiddenClassName: string = this.getClassNameWithPrefix("hidden");

    protected boldClassName: string = this.getClassNameWithPrefix("bold");
    protected italicClassName: string = this.getClassNameWithPrefix("italic");
    protected underlinedClassName: string = this.getClassNameWithPrefix("underlined");

    protected element: Selection;

    protected constructorOptions: ConstructorOptionsType;
    protected renderOptions: RenderOptionsType;

    protected minWidth: number = 20;
    protected width: number;

    protected minHeight: number = 20;
    protected height: number;

    private isComponentShown: boolean = true;

    public abstract render(options: RenderOptionsType): void;

    public initElement(
        baseElement: Selection,
        className: string,
        tagName: string = "div",
    ): void {
        this.element = this.createElement(
            baseElement,
            className,
            tagName,
        );
    }

    public clear(): void {
        if (!this.element) {
            return;
        }

        this.clearElement(this.element);
    }

    public destroy(): void {
        if (this.element) {
            this.element.remove();
        }

        this.element = null;
        this.constructorOptions = null;
        this.renderOptions = null;
    }

    public hide(): void {
        if (!this.element || !this.isComponentShown) {
            return;
        }

        this.element.style("display", "none");

        this.isComponentShown = false;
    }

    public show(): void {
        if (!this.element || this.isComponentShown) {
            return;
        }

        this.element.style("display", null);

        this.isComponentShown = true;
    }

    public toggle(): void {
        if (this.isComponentShown) {
            this.hide();
        } else {
            this.show();
        }
    }

    public updateSize(width: number, height: number): void {
        if (!isNaN(width) && isFinite(width)) {
            this.width = Math.max(this.minWidth, width);
        } else {
            this.width = undefined;
        }

        if (!isNaN(height) && isFinite(height)) {
            this.height = Math.max(this.minHeight, height);
        } else {
            this.height = undefined;
        }

        this.updateSizeOfElement(this.width, this.height);
    }

    public getViewport(): IViewport {
        return {
            height: this.height,
            width: this.width,
        };
    }

    public updateFormatting(
        selection: Selection,
        settings: TextFormattingDescriptor,
    ): void {
        if (!selection || !settings) {
            return;
        }

        selection
            .style("font-size", settings.fontSizePx)
            .style("font-family", settings.fontFamily.value)
            .style("color", settings.color.value.value)
            .classed(this.boldClassName, settings.isBold.value)
            .classed(this.italicClassName, settings.isItalic.value)
            .classed(this.underlinedClassName, settings.isUnderlined.value);
    }

    protected createElement(
        baseElement: Selection,
        className: string,
        tagName: string = "div",
    ): Selection {
        return baseElement
            .append(tagName)
            .classed(this.getClassNameWithPrefix(className), true);
    }

    protected getClassNameWithPrefix(className: string): string {
        return className
            ? `${this.getClassNamePrefix()}${className}`
            : className;
    }

    protected getClassNamePrefix(): string {
        return "multiKpi_";
    }

    protected getSelectorWithPrefix(className: string): CssConstants.ClassAndSelector {
        return CssConstants.createClassAndSelector(this.getClassNameWithPrefix(className));
    }

    protected clearElement(element: Selection): void {
        element
            .selectAll("*")
            .remove();
    }

    protected updateViewport(viewport: IViewport): void {
        this.element
            .style("width", pixelConverter.toString(viewport.width))
            .style("height", pixelConverter.toString(viewport.height));
    }

    public get isShown(): boolean {
        return this.isComponentShown;
    }

    protected updateBackgroundColor(element: Selection, color: string): void {
        if (!element) {
            return;
        }

        element.style("background-color", color || null);
    }

    protected updateSizeOfElement(width: number, height: number): void {
        if (!this.element) {
            return;
        }

        const formatedWidth: string = width !== undefined && width !== null
            ? pixelConverter.toString(width)
            : null;

        const formatedHeight: string = height !== undefined && height !== null
            ? pixelConverter.toString(height)
            : null;

        this.element
            .style("min-width", formatedWidth)
            .style("max-width", formatedWidth)
            .style("width", formatedWidth)
            .style("min-height", formatedHeight)
            .style("max-height", formatedHeight)
            .style("height", formatedHeight);
    }

    protected updateElementOrder(element: Selection, order: number): void {
        if (!element) {
            return;
        }

        const browserSpecificOrder: number = order + 1;

        element
            .style("-webkit-box-ordinal-group", browserSpecificOrder)
            .style("-ms-flex-order", order)
            .style("order", order);
    }

    protected updateMargin(element: Selection, margin: IMargin): void {
        if (!element) {
            return;
        }

        element
            .style("padding-bottom", pixelConverter.toString(margin.bottom))
            .style("padding-left", pixelConverter.toString(margin.left))
            .style("padding-right", pixelConverter.toString(margin.right))
            .style("padding-top", pixelConverter.toString(margin.top));
    }

    protected getMarginByThickness(
        thickness: number,
        defaultMargin: IMargin = { top: 0, right: 0, bottom: 0, left: 0 },
    ): IMargin {
        if (isNaN(thickness)) {
            return defaultMargin;
        }

        return {
            bottom: thickness,
            left: thickness,
            right: thickness,
            top: thickness,
        };
    }
}
