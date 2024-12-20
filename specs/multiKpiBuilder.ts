/*
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

import { VisualBuilderBase } from "powerbi-visuals-utils-testutils";

import { MultiKpi } from "../src/multiKpi";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

export class MultiKpiBuilder extends VisualBuilderBase<MultiKpi> {
    constructor(width: number, height: number) {
        super(width, height, "multiKpiEA8DA325489E436991F0E411F2D85FF3");
    }

    protected build(options: VisualConstructorOptions): MultiKpi {
        return new MultiKpi(options);
    }

    public get instance(): MultiKpi {
        return this.visual;
    }

    public get root(): HTMLElement | null {
        return this.element.querySelector(".multiKpi_multiKpi");
    }

    public get sparkline(): NodeListOf<HTMLElement> {
        return this.element.querySelectorAll(".multiKpi_sparklineComponent");
    }

    public get sparklineSubtitle(): NodeListOf<HTMLElement> {
        return this.element.querySelectorAll(".multiKpi_subtitleComponent");
    }

    public get line(): HTMLElement {
        return this.element.querySelector(".multiKpi_lineComponent");
    }

    public get sparklineLine(): NodeListOf<HTMLElement> {
        return this.element.querySelectorAll(".multiKpi_line");
    }

    public get mainChart(): HTMLElement | null {
        return this.element.querySelector(".multiKpi_mainChartComponent");
    }

    public get mainChartNAVarance(): HTMLElement {
        return this.element.querySelector(".multiKpi_mainChartComponent .multiKpi_chartLabelBaseComponent_body_variance_na");
    }

    public get subtitle(): HTMLElement | null {
        return this.element.querySelector(".multiKpi_subtitleWarningComponent");
    }

    public get staleIcon(): HTMLElement | null {
        return this.element.querySelector(".multiKpi_subtitleWarningComponent .multiKpi_dataAge");
    }
}
