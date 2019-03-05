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

import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import { ChartLabelBaseComponent, IRenderGroup } from "./chartLabelBaseComponent";

import { createVarianceConverterByType } from "../../converter/variance";

import { DataFormatter } from "../../converter/data/dataFormatter";
import { IDataRepresentationPoint } from "../../converter/data/dataRepresentation";

import { VarianceChecker } from "../../converter/variance/varianceChecker";

import { IVerticalReferenceLineComponentRenderOptions } from "../verticalReferenceLineComponent";
import { IVisualComponentConstructorOptions } from "../visualComponentConstructorOptions";

import { KpiOnHoverDescriptor } from "../../settings/descriptors/kpi/kpiOnHoverDescriptor";
import { VarianceDescriptor } from "../../settings/descriptors/varianceDescriptor";

export interface IHoverLabelComponentRenderOptions extends IVerticalReferenceLineComponentRenderOptions {
    kpiOnHoverSettings: KpiOnHoverDescriptor;
    varianceSettings: VarianceDescriptor;
}

export class HoverLabelComponent extends ChartLabelBaseComponent<IHoverLabelComponentRenderOptions> {
    constructor(options: IVisualComponentConstructorOptions) {
        super(options);

        this.element.classed(
            this.getClassNameWithPrefix("hoverLabelComponent"),
            true,
        );
    }

    public render(options: IHoverLabelComponentRenderOptions) {
        const {
            series,
            dataPoint,
            kpiOnHoverSettings,
            dateSettings,
            varianceSettings,
        } = options;

        this.updateFormatting(this.element, kpiOnHoverSettings);

        if (!series || !series.points || !dataPoint || !series.points.length) {
            this.hide();

            return;
        } else {
            this.show();
        }

        const latestDataPoint: IDataRepresentationPoint = series.points[series.points.length - 1];

        const variance: number = createVarianceConverterByType(varianceSettings.shouldCalculateDifference)
            .convert({
                firstDataPoint: dataPoint,
                secondDataPoint: latestDataPoint,
            });

        const formatter: valueFormatter.IValueFormatter = DataFormatter.getValueFormatter(
            latestDataPoint.y,
            series.settings.values,
        );

        this.renderGroup(
            this.headerSelector,
            [
                {
                    color: kpiOnHoverSettings.seriesNameColor,
                    data: series.name,
                    fontSizeInPt: kpiOnHoverSettings.seriesNameFontSize,
                    isShown: kpiOnHoverSettings.isSeriesNameShown,
                },
            ],

        );

        const isVarianceValid: boolean = VarianceChecker.isVarianceValid(variance);

        this.renderGroup(
            this.bodySelector,
            [
                {
                    color: kpiOnHoverSettings.valueColor,
                    data: formatter.format(latestDataPoint.y),
                    fontSizeInPt: kpiOnHoverSettings.valueFontSize,
                    isShown: kpiOnHoverSettings.isValueShown,
                },
                {
                    color: isVarianceValid
                        ? kpiOnHoverSettings.varianceColor
                        : kpiOnHoverSettings.varianceNotAvailableColor,
                    data: `(${DataFormatter.getFormattedVariance(variance, varianceSettings)})`,
                    fontSizeInPt: isVarianceValid
                        ? kpiOnHoverSettings.varianceFontSize
                        : kpiOnHoverSettings.varianceNotAvailableFontSize,
                    isShown: kpiOnHoverSettings.isVarianceShown,
                    selector: isVarianceValid || !kpiOnHoverSettings.autoAdjustFontSize
                        ? undefined
                        : this.varianceNotAvailableSelector,
                },
            ],
        );

        const dateGroup: IRenderGroup[] = [
            {
                color: kpiOnHoverSettings.currentValueColor,
                data: formatter.format(dataPoint.y),
                fontSizeInPt: kpiOnHoverSettings.currentValueFontSize,
                isShown: kpiOnHoverSettings.isCurrentValueShown,
            },
            {
                color: kpiOnHoverSettings.dateColor,
                data: DataFormatter.getFormattedDate(dataPoint.x, dateSettings.getFormat()),
                fontSizeInPt: kpiOnHoverSettings.dateFontSize,
                isShown: kpiOnHoverSettings.isDateShown,
            },
        ];

        const dateGroupToRender: IRenderGroup[] = kpiOnHoverSettings.isCurrentValueLeftAligned
            ? dateGroup
            : [...dateGroup].reverse(); // Makes dateGroupBase array immutable

        this.renderGroup(
            this.footerSelector,
            dateGroupToRender,
        );
    }
}
