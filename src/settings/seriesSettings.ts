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
import { SparklineAxisContainerItem } from "./descriptors/sparkline/sparklineAxisDescriptor";
import { SparklineChartContainerItem } from "./descriptors/sparkline/sparklineChartDescriptor";
import { SparklineContainerItem } from "./descriptors/sparkline/sparklineDescriptor";
import { TooltipContainerItem } from "./descriptors/tooltipDescriptor";
import { ValuesContainerItem } from "./descriptors/valuesDescriptor";
import { VarianceContainerItem } from "./descriptors/varianceDescriptor";
import { StaleDataDescriptor } from "./descriptors/staleDataDescriptor";
import { AxisBaseContainerItem } from "./descriptors/axisBaseDescriptor";
import { SparklineValueContainerItem } from "./descriptors/sparklineValueDescriptor";
import { SparklineNameContainerItem } from "./descriptors/sparklineNameDescriptor";

export class SeriesSettings {
    public values: ValuesContainerItem = new ValuesContainerItem();
    public variance: VarianceContainerItem = new VarianceContainerItem();
    public yAxis: AxisBaseContainerItem = new AxisBaseContainerItem();
    public tooltip: TooltipContainerItem = new TooltipContainerItem();
    public sparkline: SparklineContainerItem = new SparklineContainerItem();
    public sparklineLabel: SparklineNameContainerItem = new SparklineNameContainerItem();
    public sparklineChart: SparklineChartContainerItem = new SparklineChartContainerItem();
    public sparklineYAxis: SparklineAxisContainerItem = new SparklineAxisContainerItem();
    public sparklineValue: SparklineValueContainerItem = new SparklineValueContainerItem();
    public staleData: StaleDataDescriptor = new StaleDataDescriptor();
}
