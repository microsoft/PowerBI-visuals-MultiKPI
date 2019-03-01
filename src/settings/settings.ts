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

import { SettingsBase } from "./settingsBase";

import { AxisDescriptor } from "./descriptors/axisDescriptor";
import { BaseDescriptor } from "./descriptors/baseDescriptor";
import { ChartDescriptor } from "./descriptors/chartDescriptor";
import { FormatDescriptor } from "./descriptors/formatDescriptor";
import { GridDescriptor } from "./descriptors/gridDescriptor";
import { KpiDescriptor } from "./descriptors/kpi/kpiDescriptor";
import { KpiOnHoverDescriptor } from "./descriptors/kpi/kpiOnHoverDescriptor";
import { NumericDescriptor } from "./descriptors/numericDescriptor";
import { SparklineAxisDescriptor } from "./descriptors/sparkline/sparklineAxisDescriptor";
import { SparklineChartDescriptor } from "./descriptors/sparkline/sparklineChartDescriptor";
import { SparklineDescriptor } from "./descriptors/sparkline/sparklineDescriptor";
import { SubtitleAlignment, SubtitleDescriptor } from "./descriptors/subtitleDescriptor";
import { SubtitleWarningDescriptor } from "./descriptors/subtitleWarningDescriptor";
import { TooltipDescriptor } from "./descriptors/tooltipDescriptor";

export class Settings extends SettingsBase {
    public date: FormatDescriptor = new FormatDescriptor();
    public values: NumericDescriptor = new NumericDescriptor();
    public variance: NumericDescriptor = new NumericDescriptor();
    public yAxis: AxisDescriptor = new AxisDescriptor();
    public chart: ChartDescriptor = new ChartDescriptor();
    public tooltip: TooltipDescriptor = new TooltipDescriptor();
    public kpi: KpiDescriptor = new KpiDescriptor();
    public kpiOnHover: KpiOnHoverDescriptor = new KpiOnHoverDescriptor();
    public grid: GridDescriptor = new GridDescriptor();
    public sparkline: SparklineDescriptor = new SparklineDescriptor();
    public sparklineLabel: SubtitleDescriptor = new SubtitleDescriptor();
    public sparklineChart: SparklineChartDescriptor = new SparklineChartDescriptor();
    public sparklineYAxis: SparklineAxisDescriptor = new SparklineAxisDescriptor();
    public sparklineValue: SubtitleDescriptor = new SubtitleDescriptor();
    public subtitle: SubtitleWarningDescriptor = new SubtitleWarningDescriptor();
    public printMode: BaseDescriptor = new BaseDescriptor();

    constructor() {
        super();

        this.variance.precision = 2; // It's different because we need to keep the existing behavior

        this.subtitle.show = false;
        this.subtitle.fontSize = 8.25;
        this.subtitle.color = "#4F4F4F";

        const defaultColor: string = "#217cc9";
        const fontFamily: string = "wf_standard-font, helvetica, arial, sans-serif";

        this.kpi.autoAdjustFontSize = true;
        this.kpiOnHover.autoAdjustFontSize = true;

        this.sparklineLabel.alignment = SubtitleAlignment.center;
        this.sparklineLabel.color = defaultColor;
        this.sparklineLabel.fontFamily = fontFamily;
        this.sparklineLabel.paddingBottom = 0;
        this.sparklineLabel.autoAdjustFontSize = true;

        this.sparklineValue.alignment = SubtitleAlignment.center;
        this.sparklineValue.color = defaultColor;
        this.sparklineValue.fontFamily = fontFamily;
        this.sparklineValue.autoAdjustFontSize = true;

        this.sparklineYAxis.axisLabelX = 8;
        this.sparklineYAxis.axisLabelY = 2;
        this.sparklineYAxis.isShown = false;

        this.printMode.show = false;
    }
}
