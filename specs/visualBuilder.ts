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

import { MultiKpi } from "../src/visual";

export class MultiKpiBuilder extends VisualBuilderBase<MultiKpi> {
    protected build(): MultiKpi {
        return new MultiKpi({
            element: this.element.get(0),
            host: this.visualHost,
        });
    }

    public get instance(): MultiKpi {
        return this.visual;
    }

    public get $root(): JQuery {
        return this.element.find(".multiKpi_multiKpi");
    }

    public get $sparkline(): JQuery {
        return this.$root.find(".multiKpi_sparklineComponent");
    }

    public get $sparklineSubtitle(): JQuery {
        return this.$sparkline.find(".multiKpi_subtitleComponent");
    }

    public get $sparklineLine(): JQuery {
        return this.$sparkline.find(".multiKpi_line");
    }

    public get $mainChart(): JQuery {
        return this.$root.find(".multiKpi_mainChartComponent");
    }

    public get $mainChartNAVarance(): JQuery {
        return this.$root.find(".multiKpi_mainChartComponent .multiKpi_chartLabelBaseComponent_body_variance_na");
    }

    public get $subtitle(): JQuery {
        return this.$root.find(".multiKpi_subtitleWarningComponent");
    }

    public get $staleIcon(): JQuery {
        return this.$root.find(".multiKpi_subtitleWarningComponent .multiKpi_dataAge");
    }
}
