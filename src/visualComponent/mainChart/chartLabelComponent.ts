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

import { FormatDescriptor } from "../../settings/descriptors/formatDescriptor";
import { KpiDescriptor } from "../../settings/descriptors/kpi/kpiDescriptor";

import { IDataRepresentationSeries } from "../../converter/data/dataRepresentation";

import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import { ChartLabelBaseComponent } from "./chartLabelBaseComponent";

import { DataFormatter } from "../../converter/data/dataFormatter";
import { VarianceChecker } from "../../converter/variance/varianceChecker";
import { EventName } from "../../event/eventName";

export interface IChartLabelComponentRenderOptions {
    dateSettings: FormatDescriptor;
    kpiSettings: KpiDescriptor;
    series: IDataRepresentationSeries;
    viewport: powerbi.IViewport;
}

export class ChartLabelComponent extends ChartLabelBaseComponent<IChartLabelComponentRenderOptions> {
    private componentClassName: string = "chartLabelComponent";

    constructor(options: IVisualComponentConstructorOptions) {
        super(options);

        this.element.classed(
            this.getClassNameWithPrefix(this.componentClassName),
            true,
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onMouseMove}.${this.componentClassName}`,
            this.hide.bind(this),
        );

        this.constructorOptions.eventDispatcher.on(
            `${EventName.onMouseOut}.${this.componentClassName}`,
            this.show.bind(this),
        );
    }

    public render(options: IChartLabelComponentRenderOptions): void {
        const {
            series,
            kpiSettings,
        } = options;

        this.updateFormatting(this.element, options.kpiSettings);

        if (!series || !series.points) {
            this.hide();

            return;
        } else {
            this.show();
        }

        const value: number = series.points[series.points.length - 1].y;

        this.renderGroup(
            this.headerSelector,
            [
                {
                    color: kpiSettings.seriesNameColor,
                    data: series.name,
                    fontSizeInPt: kpiSettings.seriesNameFontSize,
                    isShown: kpiSettings.isSeriesNameShown,
                },
            ],
        );

        const isVarianceValid: boolean = VarianceChecker.isVarianceValid(series.variance);

        this.renderGroup(
            this.bodySelector,
            [
                {
                    color: kpiSettings.valueColor,
                    data: DataFormatter.getFormattedValue(value, series.settings.values),
                    fontSizeInPt: kpiSettings.valueFontSize,
                    isShown: kpiSettings.isValueShown,
                },
                {
                    color: isVarianceValid
                        ? kpiSettings.varianceColor
                        : kpiSettings.varianceNotAvailableColor,
                    data: `(${series.formattedVariance})`,
                    fontSizeInPt: isVarianceValid
                        ? kpiSettings.varianceFontSize
                        : kpiSettings.varianceNotAvailableFontSize,
                    isShown: kpiSettings.isVarianceShown,
                    selector: isVarianceValid || !kpiSettings.autoAdjustFontSize
                        ? undefined
                        : this.varianceNotAvailableSelector,
                },
            ],
        );

        this.renderGroup(
            this.footerSelector,
            [
                {
                    color: kpiSettings.dateColor,
                    data: `${series.dateDifference} days`,
                    fontSizeInPt: kpiSettings.dateFontSize,
                    isShown: kpiSettings.isDateShown,
                },
            ],
        );
    }
}
